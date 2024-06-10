import React from 'react';

const Preview = ({ value }) => {
  return (
    <div>
        {
            value !== "<p><br></p>" ?
            <div>
                <h2>Bài viết của bạn sẽ như thế này</h2>
                <div class="ql-container ql-snow">
                    <div class="ql-editor" dangerouslySetInnerHTML={{ __html: value }} />
                </div>
            </div>
            : null
        }
    </div>
  );
};
export default Preview;
