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
selection can be fine tuned with excluding some tags (if that tag
appears in the area in addition to the selecting tag, that area is not
included), and including or excluding selected users. Selecting a tag
shows users who have created data with that tag and also tags that
have been used together with that tag. Need to study if the selection
must be in two steps: 1) create a search (tag, -tags, +users/-users)
2) add the matching areas to map with selected color.

Additional features.

User privacy.

# REST API

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

POST /api/areas

Add an area and possibly new tags.

* request headers include token:string
* request body = {area:GeoJSON, tags:[string]}

GET /api/areas

Get areas. If token is given, returns only users' areas, otherwise
requires tag and optionally exclude tags, and include or exclude
users. If include_users key exists, exclude_users is not used. The 200
response may be an empty array.

* request headers include optionally token:string
* request body = {
  * tag:string,
  * exclude_tags:[string], // optional
  * include_users:[string], // optional
  * exclude_users:[string] // optional, disregarded if include_users is given
  * }
* 200 response body = [{area:GeoJSON, tags:[string]}]
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
