import React, { useState } from "react"
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import {
  FormGroup,
  FormLabel,
  IconButton,
  InputAdornment,
  TextField,
} from "@material-ui/core";

function handleFieldRemoval(event, curData, index) {
  let data = [...curData]
  data.splice(index, 1)
  if (data.length === 0) {
    data.push([{value: ''}])
  }
  console.log(data)
  return data;
}

function handleFieldAddition(event, curData) {
  let data = [...curData];
  data.push({value: ''})
  console.log(data)
  return data
}


function StringList({fieldName, fieldIndex, defaultValues = []}) {

  let initialState = [];
  defaultValues.forEach(value => {
    initialState.push({value: value});
  });

  if (initialState.length === 0) {
    initialState = [{value: ''}]
  }

  const [fieldItemData, updateFieldItems] = useState(initialState)

  let fieldItems = [];
  fieldItemData.forEach((item, index) => {
    console.log(item);
    fieldItems.push(
      <TextField key={`${fieldName}:${fieldIndex}:${index}`} name={fieldName} defaultValue={item.value} fullWidth
        InputProps={{
          endAdornment:
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle"
              edge="end"
              key={`item:${index}`}
              onClick={(event) => {
                updateFieldItems(handleFieldRemoval(event, fieldItemData, index))
              }}
          >
          <CloseIcon/>
          </IconButton>
        </InputAdornment>
      }}
    />
    )
  })

  return (
    <FormGroup>
      <FormLabel>{fieldName}</FormLabel>
      { fieldItems }
      <IconButton
        onClick={(event) => {
          updateFieldItems(handleFieldAddition(event, fieldItemData))
        }}>
      <AddIcon /></IconButton>
    </FormGroup>
  )
}

export default StringList
