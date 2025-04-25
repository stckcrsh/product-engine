# Rete Notes

## Running the app
```bash
$ npm run rete-pe:start
```

This will start the be and the ui and open the electron app.

## Terminology
- **Node**: A node is a single unit in the graph.  It can have inputs, outputs and controls and can process data.
- **Control**: A control is a UI element that is used to change the data in the node.  This can be a text input, a file input, a dropdown, etc.
- **Connection**: A connection is a link between 2 nodes.  It is used to pass data from one node to another.
- **Project**: A project is the collection of the graph and dashboard panels that are used to view the data from the graph.
- **Graph**: A graph is the collection of nodes and connections that are used to process data.
- **Dashboard**: A dashboard is the collection of panels that are used to view the data from the graph.
- **Panel**: A panel is a view that is used to display the data from the graph.  This can be a json viewer, a graph viewer, a text editor, etc.

## TODOs
- [ ] better page navigation
- [ ] refreshing the projects when creating a new one
- [ ] Cloning an existing project - so we dont have to start from scratch
- [ ] Set up a logging system for the nodes
- [ ] Cleanup on node removal (things like file watchers)
- [X] Initial setup page to define platform repo path
- [X] Page to view all graphs
- [X] creating and storing local only files
- [X] File service for CI to load files from the file system
- [x] initial setup page (setting up platform repo path)
- [x] Page to select and view graphs
- [X] File listener not working with multiple files on load
- [x] remove graphEditor folder from code
- [x] Reading and writing of graph files
  - [X] Reading project files
  - [X] Writing project files

### Nodes
- [ ] Better socket visualizations, denoting different types like number, string, object, jsonNode, etc
  - [ ] Validating connections between sockets so that they match correctly
- [x] jmespath/axon node
- [ ] Custom node visualization - just a better ui for the nodes
  - [ ] resizing nodes so we can see things like the monaco editor better
- [ ] Deleting nodes in the graph
- [X] Editing Node labels
- [ ] File loader node is having some race condition issues. especially on load
- [%] An actual work node (DMX policy Execution)
- [ ] Template_var node
- [ ] Merge node
- [ ] Template_context node
- [ ] Yaml node
- [ ] Json5 support for text node
- [x] Json Schema validator node
- [x] Axon Node
- [x] JSONe Node
  - [ ] Generate a uuid helper function (There is a todo in the jsone node)
- [ ] Jslt node
- [x] Policy Validator
- [X] Controls and views dont update between panel and node
- [ ] Showing data fetching errors in the graphUI somehow - like making the node red with a tooltip (things like file not found, or jsonParse errors)
- [ ] Showing data fetching errors in the dashboards
- [x] Text Node
  - [ ] Add control to parse data to json (This is to remove extraneous jsonParse nodes)
- [x] File loader node
  - [ ] Add control to parse data to json (This is to remove extraneous jsonParse nodes)

### Output Panels
- [ ] JSON Viewer with path filtering (json path, jmespath/axon)
- [ ] Switch react-json-view to react-json-view-lite
- [ ] Monaco output panel should be readonly
- [x] Policy graph viewer
  - [ ] Policy graph needs to be a solid svg so that we can mess with the proportions to fit better
  - [ ] policy graph isnt always working, has a race condition where we need to hit toggle to get it to show
  - [ ] dialogs in policy graph to see details about a node (tooltips for errors, etc)

### Control Panels
- [x] Monaco editor

### Projects
- [ ] Working with external projects (json files outside of the local storage)
- [ ] Exporting tarballs of files so that other people can import them


## There has to be a difference between UI nodes and CI nodes
The rete node processing needs to work different between UI and CI.  There are things that need to exist like the merge node creating new sockets
when a connection happens.  These things are very specific to the UI and connection creation which doesnt exist on the CI side. The shared nodes library needs to be
a specification repository that can be used to make sure that nodes that work between backend and frontend are the same.  This will allow us to have a shared library.

In the future we need to figure out how to make the processing run in the background and the frontend just shows the nodes and connections.  And all processing will be 
done behind the scenes in a worker thread.  All information will be passed to the frontend through some kind of channel like a websocket or something.


# Node Ideas
## Template_var node
This node will work like a text node but automatically does the jsonParse and also loads a template_var json schema file.  This allows us to make sure that 
all tests will correctly use schema files and validation and we can track what is impacted from changing the schemas. The output of this will be the name of the file
and the parsed json object. This doesnt have to be a source and could take in an input connection.  This way we can use something like jsonE to render the text from a 
smaller subset of variables for this graph.

## Merge node
This node takes in a dynamic number of inputs and merges them into a single output.  This is useful for things like merging multiple json files into a single json file.

## Template_context node
This is like a merge node but it instead puts each of the incoming template vars into a named key in the output. The inputs will need to all be template_var nodes.
This could also take in a schema file in a control for each incoming connection to validate the incoming data. This could be just a collection of nodes like a subnode or in the rete
documentation this is called a module.

## Jslt node
This node will take in a json object and a jslt template and output the result of the jslt template.  This will allow us to use jslt templates to transform json objects.

## Json Schema validator node
This node will take in a json object and a json schema and output whether the json object is valid against the schema.  This will allow us to validate json objects against a schema.

## Axon Node
This node will take in an expression string and a context object and return the resulting value and the full axon result object.  This will allow us to use axon expressions to transform data.

# Panel Ideas
## JSON Viewer with path filtering (json path, jmespath/axon)
This panel will take in a json object and allow you to filter the json object by a json path or a jmespath/axon query.  This will allow you to view only the parts of the json object that you are interested in.
This could be an extension to the json viewer that we already have.

