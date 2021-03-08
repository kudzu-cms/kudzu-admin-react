
import React, { useEffect, useReducer } from "react"
import axios from "axios"
import { useParams } from "react-router-dom";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import { KUDZU_BASE_URL } from "../../KudzuAdmin";
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  TextareaAutosize,
  TextField,
} from "@material-ui/core";
import { fetchContentTypes } from "./fetch";
import { timestampFormatter } from "./helpers"
import kudzuConfig from "../../kudzu.config"

function handleContentCreateSubmit(event, type, editable) {
  event.preventDefault();
  const formData = new FormData();
  editable.forEach(field => {
    if (event.target[field.name]) {
      formData.append(field.name, event.target[field.name].value);
    }
  })
  axios.post(`${KUDZU_BASE_URL}/api/content/create?type=${type}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    withCredentials: true,
  })
  .then((response) => {
    console.log(response);
    if (response.status === 200 && response.data.data[0].id) {
      window.location = `/admin/content/${type.toLowerCase()}`;;
    }
  })
  .catch((error) => {
    console.log(error)
  });
}

function ContentItemCreate() {
  let {type} = useParams();
  let externalType = type.charAt(0).toUpperCase() + type.slice(1);
  const [metadata, dispatch] = useReducer((state, action) => { return action.payload }, [])
  useEffect(() => {
    fetchContentTypes(type)
    .then(response => {
      if (response.status === 200) {
        dispatch({type: "update", payload: response.data[externalType]})
      }
    })
    .catch(error => {
      console.error(error)
    })
  }, [type, externalType, dispatch])

  if (metadata.length === 0) {
    return null;
  }

  let editableFields = [];
  metadata.forEach(value => {
    if (['uuid', 'id', 'slug', 'timestamp', 'updated'].includes(value.name)) {
      return;
    }
    editableFields.push(value);
  })

  let textareaRef = null
  return (
    <>
    <form onSubmit={event => { handleContentCreateSubmit(event, externalType, editableFields) }}>
    <Grid container spacing={3}>
      <Grid item xs={3}></Grid>
      <Grid item xs={6}>
        <Button color="primary" href={`/admin/content/${type}`}>{'< Back'}</Button>
        <h1>New {type}</h1>
        { editableFields.map((field, index) => {
          let fieldName = field.name;
          let fieldType = field.type;
          if (kudzuConfig?.types[externalType]?.fields[fieldName]?.editor) {
            fieldType = kudzuConfig.types[externalType].fields[fieldName].editor;
          }
          switch (fieldType) {
            case 'string':
              return <TextField key={`${fieldName}:${index}`} name={fieldName} fullWidth label={fieldName}/>
            case 'string:richtext':
              return (
                <>
                <CKEditor
                    key={`${fieldName}:rich:${index}`}
                    editor={ ClassicEditor }
                    data=""
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
                <TextareaAutosize key={`${fieldName}:${index}`} name={fieldName} label={fieldName} hidden />
                </>
              )
              case 'bool':
                return (
                  <FormControlLabel
                    control={<Checkbox defaultChecked={false} name={fieldName} color="primary"/>}
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
        <TextField value={"Undefined"} fullWidth disabled label={'UUID'} />
        <TextField value={"Undefined"} fullWidth disabled label={'ID'} />
        <TextField value={"Undefined"} fullWidth disabled label={'Slug'} />
        <TextField value={timestampFormatter.format(Date.now())} fullWidth disabled label={'Created'} />
        <TextField value={timestampFormatter.format(Date.now())} fullWidth disabled label={'Updated'} />
        <h3>Actions</h3>
        <Button color="primary" variant="contained" type="submit">Save</Button>
      </Grid>
    </Grid>
    </form>
    </>
  );
}

export default ContentItemCreate
