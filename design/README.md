# A Spatial Planning etc. tool

The idea is to create an app that contains / allows / does

* A map

* Users

* User to delineate areas and add them as layers into the backend

* User to attach tags to layers

* User can bring into the map view layers (possibly made from multiple
  layers in the backend) with selected tags and of selected users

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

Users: register, login, logout, add layer (= draw polygon(s), write
tags (need info on existing tags?, submit), edit layer (is this
needed?  edit polygon(s), add/delete attached tags), delete layer

All: search in tags, bring into map layers that are associated with a
selected tag. The layer can be fine tuned with requiring another tag
or tags to appear in the layer in addition to the selecting tag, and
requiring that the layer is created by a selected user. Need to study
if the selection must be in two steps: 1) create a search (tag, +tags,
+user) 2) add the layer to map with selected color.

Additional features.

User privacy.

# Real time communication

Real time communication between the client and the server is based on
channels. A channel is a string "<tag>", or "<creator>,<tag>" if the
channel is creator specific.

The client subscribes to a channel using message "subscribe to
channel" with the channel as an argument. When a creator creates or
deletes a layer, the server sends either message "new layer:
<layer_id>" or "layer deleted: <layer_id>" to all channels as there
are tags in the layer (both creator specific and general). It is then
the task of the client to act appropriately.

# REST API

## Public API

GET /tags

Get tags.

* 200 response body = [tag]
* 400 response body = {message:string}

GET /layers

Get layers. Requires tag and optionally tags, and creator. The 200
response may be an empty array.

* request params:
  * tag=string,
  * tags=string,string,... // optional, required additional tags
  * creator=string // optional, required creator
* 200 response body = [layer]
* 400 response body = {message:string}

GET /layers/:id

Get specified layer.

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

POST /api/layers

Add a layer and possibly new tags.

* request headers include token:string
* request body = {
  * tags:[string],
  * geometries:[{type: "Polygon", coordinates: [[[number]]]}]
  }

GET /api/layers

Get user's layers. Returns users' layers, tag and tags are optional. The
200 response may be an empty array.

* request headers include optionally token:string
* request params:
  * tag=string, // optional
  * tags=string,string,... // optional, required additional tags
* 200 response body = [layer]
* 400 response body = {message:string}

# Database structure

Probably redundant data needed to speed up queries like "which tags are
used together with tag x?".

user

* username:{type:String, unique:true},
* password:String

tag

* tag:String

layer

* creator:username
* geometry:GeoJSON.Polygon,
* tags:[tag]
