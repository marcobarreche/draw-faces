import sys
import os
NAME_FOLDER = './static/img'
HEAD_HTML = """<html>
    <head>
        <title>Cut the image</title>
        <link   type="text/css"       href="/static/editor.css"  rel="stylesheet"></link>
        <script type="text/javascript" src="/static/jquery-1.10.1.min.js"></script>
        <script type="text/javascript" src="/static/editor.js"></script>
    </head>
    <body>
        <div id="editor">
            <div id="title">
                <h1>Cut the Image</h1>
            </div>
            <div id="content">
                <div id="info">
                    <form id="form-faces" method="POST" action="/save_faces_position">
                        <p>Cut all the faces of the image!</p>
                        <input type="submit" id="btn-save" value="Save" />
                        <input type="button" id="btn-reset" value="reset" />
                        <input type="button" id="btn-remove-last-face" value="delete last" />
                    </form>
                    <div id="menu-prev-next">
                        <button id="prev-img">&lt;</button>
                        <input type="text" value="-1" id="number-img"/>
                        <button id="next-img">&gt;</button>
                    </div>
                </div>
                <div id="canvas-editor">
                    <canvas id="canvas1"/>
                </div>
                <img id="loading-image" src="/static/px.gif">
            </div>
        </div>
        <div id="all-images">
"""


def generate_file_with_names(namefile, folder):
    with open(namefile, 'w+') as f:
        f.write(HEAD_HTML)
        for img_name in os.listdir(folder):
            f.write('\t\t\t<img src="/static/img/%s">\n' % img_name)
        f.write('\t\t</div>\n\t</body>\n</html>')


if __name__ == "__main__":
    try:
        if (len(sys.argv) < 3):
            generate_file_with_names(sys.argv[1], NAME_FOLDER)
        else:
            generate_file_with_names(sys.argv[1], sys.argv[2])
    except IndexError:
        print '1. python generate_html.py <name_html_file>'
        print '2. python generate_html.py <name_html_file> <fold_with_all_the_images>'
        print 'If you choose the option 1. The folder with all the images will be %s' % NAME_FOLDER
