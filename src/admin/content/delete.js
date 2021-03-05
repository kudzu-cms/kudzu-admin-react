import React, { useEffect, useReducer } from "react"
import axios from "axios"
import { KUDZU_BASE_URL } from "../../KudzuAdmin";
import {
  Button,
  Grid,
} from "@material-ui/core";
import { fetchContentItem } from "./fetch";

function handleContentDeleteSubmit(event, type, id) {
  event.preventDefault();
  const formData = new FormData();
  axios.post(`${KUDZU_BASE_URL}/api/content/delete?type=${type}&id=${id}`, formData, {
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

function ContentItemDelete({itemType, itemUuid}) {
  const [itemData, dispatch] = useReducer((state, action) => { return action.payload }, {})
  let externalType = itemType.charAt(0).toUpperCase() + itemType.slice(1);
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

  return (
  <>
  <form onSubmit={event => { handleContentDeleteSubmit(event, externalType, id) }}>
  <Grid container spacing={3}>
    <Grid item xs={3}></Grid>
    <Grid item xs={6}>
      <Button color="primary" href="/admin/content">{'< Back'}</Button>
      <h1>Delete { uuid }?</h1>
      <p>This action cannot be undone.</p>
      <Button color="secondary" variant="contained" type="submit">Delete</Button>&nbsp;
      <Button color="primary" variant="contained" href={`/admin/content/${itemType}/${uuid}/edit`}>Cancel</Button>
    </Grid>
    <Grid item xs={3} />
  </Grid>
  </form>
  </>
  )
}

export default ContentItemDelete
