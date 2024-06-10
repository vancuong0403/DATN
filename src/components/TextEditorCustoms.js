import React, { useMemo } from 'react';
import { API_URL } from "../Helper/TextHelper";
import { ACCESS_TOKEN, GetCookieData } from "../Helper/CookieHelper";
import axios from 'axios';
import ImageUploader from "quill-image-uploader";
import { ImageResize } from "./ImageResize";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";
import ReactQuill, { Quill } from "react-quill";
import { Video } from "./quill-video-resize";
import "../assets/styles/quill-video-resize.css";
import "../assets/styles/TextEditor.css";

Quill.register("modules/imageUploader", ImageUploader);
Quill.register("modules/imageResize", ImageResize);
Quill.register({ "formats/video": Video });

const modules = {
    toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        ["bold", "italic", "underline", "strike", "blockquote", "code-block"],
        [{ color: [] }, { background: [] }],

        [{ align: [] }],
        [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" }
        ],
        [{ direction: "rtl" }],
        ["link", "image", "video"],
        ["clean"]
    ],
    clipboard: {
        matchVisual: false
    },
    history: {
        delay: 1000,
        maxStack: 50,
        userOnly: false
    },
    imageUploader: {
        upload: async (file) => {
            const strAccessToken = GetCookieData(ACCESS_TOKEN);
            var fmData = new FormData();
            const config = {
                headers: {
                    'content-type': 'multipart/form-data',
                    'Authorization': 'Bearer ' + strAccessToken,
                    'accept': '*/*'
                }
            };
            fmData.append('poster', file);
            const strApiURL = `${API_URL}api/Newspaper/UploadImage`;
            try {
                const response = await axios.post(strApiURL, fmData, config);
                if (response.data.isSuccess) {
                    return API_URL + response.data.dataValue;
                }
                return null;
            }
            catch (error) {
                return null;
            }
        }
    },
    imageResize: {
        displayStyles: {
            backgroundColor: "black",
            border: "none",
            color: "white"
        },
        modules: ["Resize", "DisplaySize", "Toolbar"]
    }
};

const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "code-block",
    "color",
    "background",
    "font",
    "align",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "clean",
    "code",
    "formula"
];

function TextEditorCustoms({ x_evtOnChange, x_strValue, x_bReadOnly }) {
    const editroModules = useMemo(
        () => ({
            ...modules
        }),
        []
    );

    const handleChange = (data) => {
        if (x_evtOnChange) {
            x_evtOnChange(data);
        }
    }

    return (
        <div>
            <ReactQuill
                readOnly={x_bReadOnly}
                placeholder="Nội dung..."
                theme="snow"
                modules={editroModules}
                formats={formats}
                value={x_strValue}
                onChange={handleChange}
            />
        </div>
    );
}

export default TextEditorCustoms;