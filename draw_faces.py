from flask import Flask
from flask import request
from flask import redirect
from flask import Response
from flask import g

from logging import config as logging_config  # pylint: disable=W0404
import database
import json
import logging
import os
import sys


app = Flask(__name__, static_url_path='/static', static_folder='static')
TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')
HTML_FILE = 'draw_faces.html'
NAME_FILE = './static/output.txt'
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        '': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
    }
}

try:
    logging_config.dictConfig(LOGGING)  # pylint: disable=E1101
except AttributeError:
    logging.basicConfig(level=logging.DEBUG)
    print 'The logging will not be correctly configured because you are running with Python 2.6'


@app.route('/')
def showPage():
    return redirect('static/draw_faces.html')


@app.route('/get_faces_position')
def get_faces_position():
    faces = get_position_of_faces()
    return Response(json.dumps(faces), status=200)


@app.route('/save_faces_position', methods=['POST'])
def write_face_position():
    src = request.form['src']
    fp = request.form['position']
    database.insert_position_of_faces(src, fp)
    return Response('ok', status=200)


@app.route('/generate_file', methods=['POST'])
def generate_file_with_all_positions():
    faces = get_position_of_faces()
    if not faces:
        return Response('ok', status=200)

    with open(NAME_FILE, 'w') as f:
        for url, positions in faces.items():
            f.write(url + '\n')
            for face in positions:
                f.write(write_position(face))
            f.write('.\n')
    return Response('ok', status=200)


@app.before_request
def before_request():
    g.db = database.connect_db(app)


@app.teardown_request
def teardown_request(exception):
    db = getattr(g, 'db', None)
    if db is not None:
        db.close()


def get_position_of_faces():
    faces = database.get_faces_in_all_images()
    if faces:
        faces = dict([(url, json.loads(pos)) for (url, pos) in faces])
    else:
        faces = {}
    return faces


def write_position(face):
    return '%s,%s,%s,%s\n' % (str(face.get('left')), str(face.get('top')),
                              str(face.get('width')), str(face.get('height')))


if __name__ == "__main__":
    host, port = sys.argv[1].split(':')
    app.run(host=host, debug=False, port=int(port))
