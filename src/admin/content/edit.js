import React, { useEffect, useReducer } from "react"
import axios from "axios"
import { KUDZU_BASE_URL } from "../../KudzuAdmin";
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  TextareaAutosize,
  TextField,
} from "@material-ui/core";
import { fetchContentItem, fetchContentTypes} from "./fetch";
import { timestampFormatter } from "./helpers"
import kudzuConfig from "../../kudzu.config"
import RichText from "./elements/richtext";
import StringList from "./elements/string-list";

function handleContentEditSubmit(event, type, id, editable) {
  event.preventDefault();
  const formData = new FormData();
  editable.forEach(field => {
    if (event.target[field.name]) {
      let value = null;
      switch (field.type) {
        case 'bool':
          value = event.target[field.name].checked;
          break;
        case '[]string':
          value = [];
          event.target[field.name].forEach(input => {
            value.push(input.value);
          })
          break;
        default:
          value = event.target[field.name].value;
      }
      if (value === null) {
        throw new Error(`Unknown field value for ${field.name}`)
      }
      formData.append(field.name, value);
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
      // window.location = `/admin/content/${type.toLowerCase()}`;
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
  const [metadata, dispatchMetadata] = useReducer((state, action) => { return action.payload }, [])
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

  if (!itemData.uuid || metadata.length === 0) {
    return null;
  }

  let uuid, id, slug, timestamp, updated, rest;
  ({uuid, id, slug, timestamp, updated, ...rest} = itemData);

  let editableFields = [];
  console.log(metadata)
  metadata.forEach(value => {
    if (['uuid', 'id', 'slug', 'timestamp', 'updated'].includes(value.name)) {
      return;
    }
    editableFields.push(value);
  })

  return (
  <>
  <form onSubmit={event => { handleContentEditSubmit(event, externalType, id, editableFields) }}>
  <Grid container spacing={3}>
    <Grid item xs={3}></Grid>
    <Grid item xs={6}>
      <Button color="primary" href={`/admin/content/${itemType}`}>{'< Back'}</Button>
      <h1>Edit {rest.title}</h1>
      { editableFields.map((field, index) => {
        console.log(field.name, index);
        let fieldName = field.name;
        let fieldValue = itemData[fieldName];
        let fieldType = field.type;
        if (kudzuConfig?.types[externalType]?.fields[fieldName]?.editor) {
          fieldType = kudzuConfig.types[externalType].fields[fieldName].editor;
        }
        switch (fieldType) {
          case 'string':
            return <TextField defaultValue={fieldValue} key={`${fieldName}:${index}`} name={fieldName} fullWidth label={fieldName}/>
          case '[]string':
            return <StringList fieldName={fieldName} fieldIndex={index} />
          case 'string:richtext':
            return <RichText fieldName={fieldName} fieldIndex={index} fieldValue={fieldValue} />
          case 'bool':
            return (
              <FormControlLabel
                control={<Checkbox defaultChecked={fieldValue} name={fieldName} color="primary"/>}
                label={fieldName}
              />)
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
