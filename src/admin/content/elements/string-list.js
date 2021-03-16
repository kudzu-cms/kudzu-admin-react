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

function handleFieldRemoval(event, fieldName, curData, index) {
  let data = [...curData]
  data.splice(index, 1)
  if (data.length === 0) {
    // @todo Use ref instead.
    document.getElementsByClassName(`string-list--${fieldName}`)[0].querySelector('input').value = '';
    data.push([{value: ''}])
  }
  return data;
}

function handleFieldAddition(event, curData) {
  let data = [...curData];
  data.push({value: ''})
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
                updateFieldItems(handleFieldRemoval(event, fieldName, fieldItemData, index))
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
    <FormGroup className={`string-list--${fieldName}`}>
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
