import React, { useEffect, useReducer, useState } from "react"
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
    console.log('Menu click:', name);
    updateSelectedType(name);
  }

  return (
    <>
    <Switch>
      <Route exact={true} path="/admin/content">
        <Grid container spacing={3}>
          <Grid item xs={2}>
            <Sidebar
              clickHandler={handleMenuClick}
            />
          </Grid>
          <Grid item xs={9}>
            <ContentListTable
              contentType={selectedType}
            />
          </Grid>
        </Grid>
      </Route>
      <Route path={`/admin/content/:type/create`}>
        <ContentItemCreate />
      </Route>
      <Route path={`/admin/content/:type/:uuid/:action`}>
        <ContentItemModify />
      </Route>
    </Switch>
    </>
  )
}


function getContentTypes() {
  return axios.get(`${KUDZU_BASE_URL}/api/contents/meta`, {
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

function handleContentCreateSubmit(event, type, editable) {
  event.preventDefault();
  const formData = new FormData();
  Object.keys(editable).map(key => {
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
      window.location = '/admin/content';
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
    getContentTypes(type)
    .then(response => {
      if (response.status === 200) {
        dispatch({type: "update", payload: response.data[externalType]})
      }
    })
    .catch(error => {
      console.error(error)
    })
  }, [type, dispatch])

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
        <Button color="primary" href="/admin/content">{'< Back'}</Button>
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

function ContentItemModify() {
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
  const [types, dispatch] = useReducer((state, action) => { return action.payload }, [])
  useEffect(() => {
    getContentTypes()
    .then(response => {
      console.log(response)
      if (response.status === 200) {
        let types = Object.keys(response.data)
        console.log("Sidebar", types);
        dispatch({type: "update", payload: types})
      }
    })
    .catch(error => {
      console.error(error)
    })
  }, [dispatch])
  return (
    <MenuList>
      { types.map(name => {
          return <MenuItem key={name}
          onClick={() => clickHandler(name)}
          >
          { name }
          </MenuItem>
        })
      }
    </MenuList>
  )
}

function ContentListTable({contentType}) {

  const [contentList, dispatch] = useReducer((state, action) => { return action.payload }, [])
  useEffect(() => {
    getContentOfType(contentType)
    .then(response => {
      console.log("Table", response)
      if (response.status === 200) {
        dispatch({type: "update", payload: response.data.data})
      }
    })
    .catch(error => {
      console.error(error)
    })
  }, [contentType, dispatch])

  if (contentList.length === 0) {
    return null;
  }

  return(
    <>
    <h1>Content</h1>
    <Button href={`/admin/content/${contentType.toLowerCase()}/create`}>{`Create ${contentType.toLowerCase()}`}</Button>
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
