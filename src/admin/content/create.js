
import React, { useEffect, useReducer } from "react"
import axios from "axios"
import { useParams } from "react-router-dom";

import { KUDZU_BASE_URL } from "../../KudzuAdmin";
import {
  Button,
  Grid,
  TextField,
} from "@material-ui/core";
import { fetchContentTypes } from "./fetch";
import { timestampFormatter } from "./helpers"

function handleContentCreateSubmit(event, type, editable) {
  event.preventDefault();
  const formData = new FormData();
  Object.keys(editable).forEach(key => {
    if (event.target[key]) {
      formData.append(key, event.target[key].value);
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
  const [metadata, dispatch] = useReducer((state, action) => { return action.payload }, {})
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

  if (Object.keys(metadata) === 0) {
    return null;
  }

  let UUID, ID, Slug, Timestamp, Updated, rest;
  ({UUID, ID, Slug, Timestamp, Updated, ...rest} = metadata);

  if (Object.keys(rest) === 0) {
    return null;
  }

  let editableFields = [];
  for (const [name, type] of Object.entries(rest)) {
    editableFields.push([name, type]);
  }

  return (
    <>
    <form onSubmit={event => { handleContentCreateSubmit(event, externalType, rest) }}>
    <Grid container spacing={3}>
      <Grid item xs={3}></Grid>
      <Grid item xs={6}>
        <Button color="primary" href={`/admin/content/${type}`}>{'< Back'}</Button>
        <h1>New {type}</h1>
        { editableFields.map((field, index) => {
          let fieldName = field[0];
          let fieldType = field[1];
          switch (fieldType) {
            case 'string':
              return <TextField key={`${fieldName}:${index}`} name={fieldName} fullWidth label={fieldName}/>
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
