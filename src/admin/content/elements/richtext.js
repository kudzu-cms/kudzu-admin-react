
import React from "react"
import { TextareaAutosize } from "@material-ui/core";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const ckeditorConfig = {
  toolbar: [
    'heading',
    'bold',
    'italic',
    'link',
    'numberedList',
    'bulletedList',
    'blockQuote'
  ]
}

function RichText({fieldName, fieldValue, fieldIndex}) {
  let textareaRef = null;
  return (
    <>
    <CKEditor
        key={`${fieldName}:richtext:${fieldIndex}`}
        editor={ ClassicEditor }
        data={fieldValue}
        config={ckeditorConfig}
        onReady={ editor => {
          // Get available toolbar items. Not all are currently supported.
          // console.log(Array.from(editor.ui.componentFactory.names()))
        }}
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
    <TextareaAutosize key={`${fieldName}:${fieldIndex}`} name={fieldName} defaultValue={fieldValue} label={fieldName} hidden />
    </>
  )
}

export default RichText
