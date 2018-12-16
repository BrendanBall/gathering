extern crate serde;
extern crate serde_json;
#[macro_use]
extern crate serde_derive;
#[macro_use]
extern crate juniper;
extern crate actix;
extern crate actix_web;
extern crate env_logger;
extern crate futures;
extern crate chashmap;

use actix::prelude::*;
use actix_web::{
    http,
    http::{header},
    middleware,
    middleware::cors::Cors,
    server, App, AsyncResponder, Error, FutureResponse, HttpResponse, Json, State,
};
use futures::future::Future;
use juniper::http::GraphQLRequest;
use juniper::{FieldResult, RootNode, FieldError, Value};

use chashmap::CHashMap;
use std::sync::Arc;

#[derive(GraphQLObject, Clone)]
pub struct Room {
    id: String,
    members: Vec<User>,
}

#[derive(GraphQLObject, Clone)]
struct User {
    id: String,
    name: String,
}

#[derive(GraphQLInputObject, Clone)]
pub struct UserInput {
    id: String,
    name: String,
}

#[derive(GraphQLInputObject, Clone)]
pub struct JoinRoomInput {
    id: String,
    user: UserInput,
}


pub struct QueryRoot;

#[derive(Clone)]
pub struct Context {
    pub db: Arc<CHashMap<String, Room>>
}

impl juniper::Context for Context {}

graphql_object!(QueryRoot: Context |&self| {
    field room(&executor, id: String) -> FieldResult<Room> {
        let room = executor.context().db.get(&id);
        match room {
            Some(room) => Ok(room.clone()),
            None => Err(FieldError::new("Room not found", Value::null())),
        }
    }
});

pub struct MutationRoot;

graphql_object!(MutationRoot: Context |&self| {
    field joinRoom(&executor, input: JoinRoomInput) -> FieldResult<Room> {
        let room = Room{id: input.id.clone(), members: vec![User{id: input.user.id, name: input.user.name}]};
        executor.context().db.insert(input.id, room.clone());
        Ok(room.clone())
    }
});

pub type Schema = RootNode<'static, QueryRoot, MutationRoot>;

pub fn create_schema() -> Schema {
    Schema::new(QueryRoot {}, MutationRoot {})
}

struct AppState {
    graphql: Addr<GraphQLExecutor>,
}

#[derive(Serialize, Deserialize)]
pub struct GraphQLData(GraphQLRequest);

impl Message for GraphQLData {
    type Result = Result<String, Error>;
}


pub struct GraphQLExecutor {
    schema: Arc<Schema>,
    context: Context,
}

impl GraphQLExecutor {
    fn new(schema: Arc<Schema>, context: Context) -> GraphQLExecutor {
        GraphQLExecutor { schema, context }
    }
}

impl Actor for GraphQLExecutor {
    type Context = SyncContext<Self>;
}

impl Handler<GraphQLData> for GraphQLExecutor {
    type Result = Result<String, Error>;

    fn handle(&mut self, msg: GraphQLData, _: &mut Self::Context) -> Self::Result {
        let res = msg.0.execute(&self.schema, &self.context);
        let res_text = serde_json::to_string(&res)?;
        Ok(res_text)
    }
}

fn graphql((st, data): (State<AppState>, Json<GraphQLData>)) -> FutureResponse<HttpResponse> {
    st.graphql
        .send(data.0)
        .from_err()
        .and_then(|res| match res {
            Ok(user) => Ok(HttpResponse::Ok()
                .content_type("application/json")
                .body(user)),
            Err(_) => Ok(HttpResponse::InternalServerError().into()),
        }).responder()
}

fn main() {
    ::std::env::set_var("RUST_LOG", "actix_web=info");
    env_logger::init();
    let sys = actix::System::new("gathering");

    let db = Arc::new(CHashMap::new());
    let schema_context = Context { db: db.clone() };

    let schema = Arc::new(create_schema());
    let schema_addr = SyncArbiter::start(3, move || GraphQLExecutor::new(schema.clone(), schema_context.clone()));


    server::new(move || {
        App::with_state(AppState {
            graphql: schema_addr.clone(),
        })
        .middleware(middleware::Logger::default())
        .configure(|app| {
            Cors::for_app(app)
                .allowed_origin("http://localhost:8000")
                .allowed_methods(vec!["POST"])
                // .allowed_headers(vec![header::AUTHORIZATION, header::ACCEPT])
                // .allowed_header(header::CONTENT_TYPE)
                .supports_credentials()
                .max_age(3600)
                .resource("/graphql", |r| r.method(http::Method::POST).with(graphql))
                .register()

        })
    }).bind("127.0.0.1:8080")
    .unwrap()
    .start();

    println!("Started http server: 127.0.0.1:8080");
    let _ = sys.run();
}