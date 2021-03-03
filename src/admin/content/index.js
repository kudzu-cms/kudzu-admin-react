import React, { useEffect, useState } from "react"
import axios from "axios"
import { Route, Switch, useParams } from "react-router-dom";
import { validate as uuidValidate } from 'uuid';

import { KUDZU_BASE_URL } from "../../KudzuAdmin";
import {
  Button,
  Grid,
  MenuItem,
  MenuList,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@material-ui/core";
import NoMatch from "../../misc/no-match";

const timestampFormatter = Intl.DateTimeFormat("default", {
  month: "numeric",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  timeZoneName: "short"
});

function Content() {

  const [selectedType, updateSelectedType] = useState("Test");

  function handleMenuClick(name) {
    updateSelectedType(name);
  }

  return (
    <>
    <Switch>
      <Route exact={true} path="/admin/content">
        <Grid container spacing={3}>
          <Grid item xs={2}>
            {/* <Sidebar
              clickHandler={handleMenuClick}
            /> */}
          </Grid>
          <Grid item xs={9}>
            <ContentListTable
              contentType={selectedType}
            />
          </Grid>
        </Grid>
      </Route>
      <Route path={`/admin/content/:type/:uuid/:action`}>
        <ContentItem />
      </Route>
    </Switch>
    </>
  )
}


function getContentTypes() {
  return axios.get(`${KUDZU_BASE_URL}/admin/contents/meta`, {
    withCredentials: true,
  })
}

function getContentOfType(type) {
  return axios.get(`${KUDZU_BASE_URL}/api/contents?type=${type}`, {
    withCredentials: false,
  })
}

function fetchContentItem(type, uuid) {
  return axios.get(`${KUDZU_BASE_URL}/api/content?slug=${type}-${uuid}`, {
    withCredentials: false,
  })
}

function ContentItem() {
  let {type, uuid, action} = useParams();

  if (typeof type !== "string" ||
  !uuidValidate(uuid) ||
  !['edit', 'delete'].includes(action)) {
    return <NoMatch />
  }

  if (action === 'edit') {
    return <ContentItemEdit itemType={type} itemUuid={uuid} />
  }

  return <ContentItemDelete itemType={type} itemUuid={uuid} />
}

function ContentItemEdit({itemType, itemUuid}) {
  const [itemData, setItemData] = useState({});
  useEffect(() => {
    fetchContentItem(itemType, itemUuid)
    .then(response => {
      console.log("Edit", response)
      if (response.status === 200) {
        setItemData(response.data.data[0])
      }
    })
    .catch(error => {
      console.error(error)
    })
  }, [itemType, itemUuid, itemData.uuid])

  if (!itemData["uuid"]) {
    return null;
  }

  let uuid, id, slug, timestamp, updated, rest;
  ({uuid, id, slug, timestamp, updated, ...rest} = itemData);

  return (
  <>
  <form>
  <Grid container spacing={3}>
    <Grid item xs={3}></Grid>
    <Grid item xs={6}>
      <Button color="primary" href="/admin/content">{'< Back'}</Button>
      <h1>{rest.title}</h1>
      <TextField defaultValue={rest.title} fullWidth label={"Title"}>{rest.title}</TextField>
    </Grid>
    <Grid item xs={3}>
      <h3>Locked fields</h3>
      <TextField value={uuid} fullWidth disabled label={'UUID'} />
      <TextField value={id} fullWidth disabled label={'ID'} />
      <TextField value={slug} fullWidth disabled label={'Slug'} />
      <TextField value={timestampFormatter.format(timestamp)} fullWidth disabled label={'Created'} />
      <TextField value={timestampFormatter.format(updated)} fullWidth disabled label={'Updated'} />
      <h3>Actions</h3>
      <Button color="primary" variant="contained">Save</Button>&nbsp;
      <Button color="secondary" variant="contained" href={`/admin/content/${itemType.toLowerCase()}/${itemUuid}/delete`}>Delete</Button>
    </Grid>
  </Grid>
  </form>
  </>
  )
}

function ContentItemDelete({itemType, itemUuid}) {
  return <h3>delete: {itemType}, {itemUuid}</h3>
}

function Sidebar({clickHandler}) {
  const [contentTypes, updateContentTypes] = useState([]);
  useEffect(() => {
    getContentTypes()
    .then(response => {
      console.log(response)
      if (response.status === 200) {
        let types = Object.keys(response.data)
        console.log("Sidebar", types);
        updateContentTypes(types)
      }
    })
    .catch(error => {
      console.error(error)
    })
  })
  return (
    <MenuList>
      { contentTypes.map(name => {
          return <MenuItem key={name}
          onClick={clickHandler(name)}
          >
          { name }
          </MenuItem>
        })
      }
    </MenuList>
  )
}

function ContentListTable({contentType}) {

  const [contentList, updateContentList] = useState([{}]);
  useEffect(() => {
    getContentOfType(contentType)
    .then(response => {
      console.log("Table", response)
      if (response.status === 200) {
        updateContentList(response.data.data);
      }
    })
    .catch(error => {
      console.error(error)
    })
  }, [contentList[0].uuid, contentType])

  return(
    <>
    <h1>Content</h1>
    <TableContainer>
    <Table size="small">
      <TableHead>
        <TableRow>
          { ["UUID", "ID", "Slug", "Created", "Updated", "Edit", "Delete"].map(value => {
            return <TableCell key={value} align="left">{ value }</TableCell>
          })

          }
        </TableRow>
      </TableHead>
      <TableBody>
        { contentList.map(value => {
            return(
              <TableRow key={value.uuid}>
                <TableCell key={`${value.uuid}:uuid`} align="left">{ value.uuid }</TableCell>
                <TableCell key={`${value.uuid}:id`} align="left">{ value.id }</TableCell>
                <TableCell key={`${value.uuid}:slug`} align="left">{ value.slug }</TableCell>
                <TableCell key={`${value.uuid}:timestamp`} align="left">{ timestampFormatter.format(value.timestamp) }</TableCell>
                <TableCell key={`${value.uuid}:updated`} align="left">{ timestampFormatter.format(value.updated) }</TableCell>
                {/* @todo Use a single split button, see https://material-ui.com/components/button-group/#split-button */}
                <TableCell key={`${value.uuid}:edit`} align="left">
                  <Button color="primary" variant="contained" href={`/admin/content/${contentType.toLowerCase()}/${value.uuid}/edit`}>Edit</Button>
                </TableCell>
                <TableCell key={`${value.uuid}:delete`} align="left">
                  <Button color="secondary" variant="contained" href={`/admin/content/${contentType.toLowerCase()}/${value.uuid}/delete`}>Delete</Button>
                </TableCell>
              </TableRow>
            )
          })
        }
      </TableBody>
    </Table>
  </TableContainer>
  </>
  )
}

export default Content
