import React, { useEffect, useReducer } from "react"
import axios from "axios"
import { KUDZU_BASE_URL } from "../../KudzuAdmin";
import {
  Button,
  Grid,
  TextareaAutosize,
  TextField,
} from "@material-ui/core";
import { fetchContentItem} from "./fetch";
import { timestampFormatter } from "./helpers"
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

function handleContentEditSubmit(event, type, id, editable) {
  event.preventDefault();
  const formData = new FormData();
  Object.keys(editable).forEach(key => {
    if (event.target[key]) {
      formData.append(key, event.target[key].value);
    }
  })
  axios.post(`${KUDZU_BASE_URL}/api/content/update?type=${type}&id=${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    withCredentials: true,
  })
  .then((response) => {
    console.log(response);
    if (response.status === 200 && response.data.data[0].id) {
      window.location = `/admin/content/${type.toLowerCase()}`;
    }
  })
  .catch((error) => {
    console.log(error)
  });
}

function ContentItemEdit({itemType, itemUuid}) {
  const [itemData, dispatch] = useReducer((state, action) => { return action.payload }, {})
  useEffect(() => {
    fetchContentItem(itemType, itemUuid)
    .then(response => {
      console.log("Edit", response)
      if (response.status === 200) {
        dispatch({type: "update", payload: response.data.data[0]})
      }
    })
    .catch(error => {
      console.error(error)
    })
  }, [itemType, itemUuid, dispatch])

  if (!itemData.uuid) {
    return null;
  }

  let uuid, id, slug, timestamp, updated, rest;
  ({uuid, id, slug, timestamp, updated, ...rest} = itemData);

  let type = slug.slice(0, slug.indexOf('-'))
  let externalType = type.charAt(0).toUpperCase() + type.slice(1);

  let editableFields = [];
  for (const [name, value] of Object.entries(rest)) {
    editableFields.push([name, value]);
  }

  let textareaRef = null;
  return (
  <>
  <form onSubmit={event => { handleContentEditSubmit(event, externalType, id, rest) }}>
  <Grid container spacing={3}>
    <Grid item xs={3}></Grid>
    <Grid item xs={6}>
      <Button color="primary" href={`/admin/content/${type}`}>{'< Back'}</Button>
      <h1>Edit {rest.title}</h1>
      { editableFields.map((field, index) => {
        let fieldName = field[0];
        let fieldValue = field[1];
        switch ('string:rich') {
          case 'string':
            return <TextField defaultValue={fieldValue} key={`${fieldName}:${index}`} name={fieldName} fullWidth label={fieldName}/>
          case 'string:rich':
            return (
              <>
              <CKEditor
                  key={`${fieldName}:rich:${index}`}
                  editor={ ClassicEditor }
                  data={fieldValue}
                  onChange={(event, editor) => {
                      const data = editor.getData();
                      if (textareaRef) {
                        textareaRef.value = data;
                        return
                      }
                      let currentElement = editor.sourceElement
                      while (currentElement) {
                        if (currentElement.nodeName === "TEXTAREA") {
                          break;
                        }
                        currentElement = currentElement.nextElementSibling;
                      }
                      textareaRef = currentElement
                      textareaRef.value = data;
                  }}
              />
              <TextareaAutosize key={`${fieldName}:${index}`} name={fieldName} label={fieldName} defaultValue={fieldValue} hidden />
              </>
            )
          default:
            throw new Error(`Unknown field type: ${'fieldType'}`);
        }
        })
      }
    </Grid>
    <Grid item xs={3}>
      <h3>Locked fields</h3>
      <TextField value={uuid} fullWidth disabled label={'UUID'} />
      <TextField value={id} fullWidth disabled label={'ID'} />
      <TextField value={slug} fullWidth disabled label={'Slug'} />
      <TextField value={timestampFormatter.format(timestamp)} fullWidth disabled label={'Created'} />
      <TextField value={timestampFormatter.format(updated)} fullWidth disabled label={'Updated'} />
      <h3>Actions</h3>
      <Button color="primary" type="submit" variant="contained">Save</Button>&nbsp;
      <Button color="secondary" variant="contained" href={`/admin/content/${itemType.toLowerCase()}/${itemUuid}/delete`}>Delete</Button>
    </Grid>
  </Grid>
  </form>
  </>
  )
}


export default ContentItemEdit
