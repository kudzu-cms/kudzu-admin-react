import React, { useEffect, useReducer } from "react"
import { Redirect, Route, Switch, useParams } from "react-router-dom";
import { validate as uuidValidate } from 'uuid';

import {
  Button,
  Grid,
  Link,
  MenuItem,
  MenuList,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import NoMatch from "../../misc/no-match";
import { fetchContentOfType, fetchContentTypes } from "./fetch";
import ContentItemCreate from "./create";
import ContentItemEdit from "./edit";
import ContentItemDelete from "./delete";
import { timestampFormatter } from "./helpers"

function Content() {

  return (
    <>
    <Switch>
    <Route exact={true} path="/admin/content">
      <Redirect to="/admin/content/test" />
    </Route>
      <Route exact={true} path="/admin/content/:type">
        <Grid container spacing={3}>
          <Grid item xs={2}>
            <Sidebar />
          </Grid>
          <Grid item xs={9}>
            <ContentListTable />
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

function Sidebar() {
  const [types, dispatch] = useReducer((state, action) => { return action.payload }, [])
  useEffect(() => {
    fetchContentTypes()
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
          return <Link href={`/admin/content/${name.toLowerCase()}`} key={name}><MenuItem>{name}</MenuItem></Link>})
      }
    </MenuList>
  )
}

function ContentListTable() {
  let {type} = useParams();
  let externalType = type.charAt(0).toUpperCase() + type.slice(1);
  const [contentList, dispatch] = useReducer((state, action) => { return action.payload }, [])
  useEffect(() => {
    fetchContentOfType(externalType)
    .then(response => {
      console.log("Table", response)
      if (response.status === 200) {
        dispatch({type: "update", payload: response.data.data})
      }
    })
    .catch(error => {
      console.error(error)
    })
  }, [externalType, dispatch])

  if (contentList.length === 0) {
    return (
      <>
      <h1>Content</h1>
      No {externalType} content has been created:
      <Button href={`/admin/content/${type}/create`}>{`Create ${type}`}</Button>
      </>
    );
  }

  return(
    <>
    <h1>Content</h1>
    <Button href={`/admin/content/${type}/create`}>Create {type}</Button>
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
                  <Button color="primary" variant="contained" href={`/admin/content/${type}/${value.uuid}/edit`}>Edit</Button>
                </TableCell>
                <TableCell key={`${value.uuid}:delete`} align="left">
                  <Button color="secondary" variant="contained" href={`/admin/content/${type}/${value.uuid}/delete`}>Delete</Button>
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
