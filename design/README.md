# A Spatial Planning etc. tool

The idea is to create an app that contains / allows / does

* A map

* Users

* User to delineate areas

* User to attach tags to areas

* User can bring into the map view areas with selected tags and of selected users

* The app updates itself

The idea is to create an app that can be used to e.g., create a
simulation of a situation room that follows delineation of
contaminated area and locations of nature or other values the
contamination threatens, and protection measures carried out.

# Technologies

Infrastructure: Mongo, Mongoose, Node, Express, React

*Since I'm learning these*

Mapping library: React-Leaflet, react-leaflet-draw, geojson

*Since I haven't used Leaflet and its React wrappers seem ok*

Real-time communication: Socket.IO

*Probably the best / most suitable*

# Features

Initial set of features.

Users: register, login, logout, add area (= draw polygon, write tags
(need info on existing tags?, submit), edit area (is this needed? edit
polygon, add/delete attached tags), delete area

All: search in tags, bring areas into map with a selected tag. The
selection can be fine tuned with requiring another tag or tags to
appear in the area in addition to the selecting tag, and requiring
that the area is created by a selected user. Need to study if the
selection must be in two steps: 1) create a search (tag, +tags, +user)
2) add the matching areas to map with selected color.

Additional features.

User privacy.

# REST API

## Public API

GET /tags

Get tags.

* 200 response body = [tag]
* 400 response body = {message:string}

GET /areas

Get areas. Requires tag and optionally tags, and creator. The 200
response may be an empty array.

* request params:
  * tag=string,
  * tags=string,string,... // optional, required additional tags
  * creator=string // optional, required creator
* 200 response body = [area]
* 400 response body = {message:string}

POST /register

Register a new user.

* request body = {username:string, password:string}
* 200 response body = {message:"success"}
* 409 response body = {message:string}

POST /login

Login an existing user.

* request body = {username:string, password:string}
* response status = 200, 403
* 200 response body = {toke:string}
* 403 response body = {message:string}

POST /logout

Logout a logged in user.

* request headers include token:string
* 200 response body = {message:"success"}
* 404 response body = {message:string}

## Creator API (needs authentication)

POST /api/areas

Add an area and possibly new tags.

* request headers include token:string
* request body = {area:GeoJSON, tags:[string]}

GET /api/areas

Get user's areas. Returns users' areas, tag and tags are optional. The
200 response may be an empty array.

* request headers include optionally token:string
* request params:
  * tag=string, // optional
  * tags=string,string,... // optional, required additional tags
* 200 response body = [area]
* 400 response body = {message:string}

# Database structure

Probably redundant data needed to speed up queries like "which tags are
used together with tag x?".

user

* username:{type:String, unique:true},
* password:String

tag

* tag:String

area

* creator:user.username
* area:GeoJSON.Polygon,
* tags:[tag]
