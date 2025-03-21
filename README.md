# ProductEngine
## Description
The product engine is supposed to help facilitate project workflows.  When working on policy files, app flow configs or dmx tasks or really anything in our system, we need a way to manage the files and the flow of the data.  This is where the product engine comes in.  It is a graph based system that allows us to create a flow of data from one node to another.  This should be used to create a processing flow that will help facilitate local development and CI/CD workflows.

## Running the product engine
To run the product engine, you will need to have the following installed:


You have to force the install because i havent fixed the package peer dependency issues yet.
```bash
$ npm install --force
$ npm run rete-pe:start
```

This will start the be and the ui and open the electron app.

Current nodes and their functionality:

- JsonE Node: This node renders a json template using a context object.
- Json Parse Node: This node takes in a json string as its input and outputs a js object.
- Text Node: This node allows us to insert text into the graph.
- File Loader Node: This node loads a file from the platform repo and returns its file contents.
- Axon Node: This node takes in an expression string and a context object and returns the resulting value and the full axon result object.
- Json Schema Node: This node takes in a json schema and a json object and returns the incoming object if its valid against the schema, if not then it returns errors

> There are a few nodes that exist but either dont work or you need to setup some dependencies to get them running. 
> - Policy Nodes (Executor, Validator) - these nodes need rex running locally with changes to get them to work
> - mergeNode - This is a wip node that will be used to merge lots of data into a central object, useful for template context.

## Considerations
The Product Engine is a work in progress and there are a bunch of optimizations and quality of life changes that need to exist.  But in the mean time some things you need to think about.

Anything that returns text will more than likely need to be passed through a json parse node to be used in other nodes (this includes text nodes and file nodes).  This is because most nodes expect a js object. There are exceptions to that rule like axon nodes which resolve only a string. In the future i plan to add ways to differentiate the sockets on the nodes by type and not allow invalid connections;


