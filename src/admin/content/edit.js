import React, { useEffect, useReducer } from "react"
import axios from "axios"
import { KUDZU_BASE_URL } from "../../KudzuAdmin";
import {
  Button,
  Grid,
  TextareaAutosize,
  TextField,
} from "@material-ui/core";
import { fetchContentItem, fetchContentTypes} from "./fetch";
import { timestampFormatter } from "./helpers"
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import kudzuConfig from "../../kudzu.config"

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
  const [itemData, dispatchItem] = useReducer((state, action) => { return action.payload }, {})
  useEffect(() => {
    fetchContentItem(itemType, itemUuid)
    .then(response => {
      if (response.status === 200) {
        dispatchItem({type: "update", payload: response.data.data[0]})
      }
    })
    .catch(error => {
      console.error(error)
    })
  }, [itemType, itemUuid, dispatchItem])

  let externalType = itemType.charAt(0).toUpperCase() + itemType.slice(1);
  const [metadata, dispatchMetadata] = useReducer((state, action) => { return action.payload }, {})
  useEffect(() => {
    fetchContentTypes(itemType)
    .then(response => {
      if (response.status === 200) {
        dispatchMetadata({type: "update", payload: response.data[externalType]})
      }
    })
    .catch(error => {
      console.error(error)
    })
  }, [itemType, externalType, dispatchMetadata])

  if (!itemData.uuid || Object.keys(metadata).length === 0) {
    return null;
  }

  let uuid, id, slug, timestamp, updated, rest;
  ({uuid, id, slug, timestamp, updated, ...rest} = itemData);

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
      <Button color="primary" href={`/admin/content/${itemType}`}>{'< Back'}</Button>
      <h1>Edit {rest.title}</h1>
      { editableFields.map((field, index) => {
        let fieldName = field[0];
        let fieldValue = field[1];
        let externalFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        let fieldType = metadata[externalFieldName]
        if (kudzuConfig?.types[externalType]?.fields[externalFieldName]?.editor) {
          fieldType = kudzuConfig.types[externalType].fields[externalFieldName].editor;
        }
        switch (fieldType) {
          case 'string':
            return <TextField defaultValue={fieldValue} key={`${fieldName}:${index}`} name={fieldName} fullWidth label={fieldName}/>
        case 'string:richtext':
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
            throw new Error(`Unknown field type: ${fieldType}`);
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
