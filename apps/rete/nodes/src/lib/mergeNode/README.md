# MergeNode

## Overview

The MergeNode is a utility node that combines multiple inputs into a single output object. Each input is assigned a key, and the corresponding value is added to the output object under that key.

## Features

- **Dynamic Inputs**: The node can have any number of inputs, each with its own key.
- **Key Customization**: Each input key can be customized to create a meaningful output structure.
- **Automatic Input Creation**: New inputs are created when requested.
- **Input Removal**: Unused inputs can be removed to keep the node clean.

## Usage

1. **Adding the Node**: Add a MergeNode to your graph from the node palette.
2. **Connecting Inputs**: Connect outputs from other nodes to the MergeNode. Each connection will create a new input if needed.
3. **Customizing Keys**: Click on the key label next to each input to edit the key name.
4. **Using the Output**: The output of the MergeNode is a single object containing all input values, organized by their keys.

## Example

If you have:
- Input 1 with key "pricing" connected to a node outputting 100
- Input 2 with key "branding" connected to a node outputting `{"logo": "logo.png", "color": "blue"}`

The MergeNode will output:
```json
{
  "pricing": 100,
  "branding": {
    "logo": "logo.png",
    "color": "blue"
  }
}
```

## Technical Details

- **Node Type**: `MergeNode`
- **Inputs**: Dynamic (created as needed)
- **Output**: Single output with the merged object
- **Controls**: Key controls for each input

## Implementation Notes

The MergeNode implementation follows these key principles:

1. **Dynamic Input Management**: The node maintains a collection of inputs that can be added or removed as needed.
2. **Key-Value Mapping**: Each input has an associated key control that determines the property name in the output object.
3. **Data Processing**: When processing data, the node collects values from all connected inputs and merges them into a single object.
4. **Connection Handling**: The node automatically creates new inputs when connections are made and can remove unused inputs.

## Graph File Format

The MergeNode conforms to the following format in graph files:

```json
{
  "id": "mergeNode1",
  "label": "TemplateContext",
  "type": "MergeNode",
  "data": [
    {
      "key": "inputKey:1",
      "value": "pricing"
    },
    {
      "key":"inputKey:2",
      "value": "branding"
    }
  ]
}
```

With connections:

```json
{
  "id": "bdf10b9ff8dfabf2",
  "source": "textNode1",
  "sourceOutput": "value",
  "target": "mergeNode1",
  "targetInput": "inputValue:1"
},
{
  "id": "bdf10b9ff8dfabf3",
  "source": "textNode2",
  "sourceOutput": "value",
  "target": "mergeNode1",
  "targetInput": "inputValue:2"
}
```
