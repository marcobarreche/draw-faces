from flask import Flask, request, redirect, Response
from logging import config as logging_config  # pylint: disable=W0404
import json
import logging
app = Flask(__name__, static_url_path='/static', static_folder='static')
NAME_FILE = 'static/output.txt'

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
    return redirect('static/cut-the-image.html')


def write_position(face):
    print face
    return '%s,%s,%s,%s\n' % (str(face.get('left')), str(face.get('top')),
                              str(face.get('width')), str(face.get('height')))


@app.route('/save_faces_position', methods=['POST'])
def write_face_position():
    src = request.form['src']
    fp = request.form['position']
    with open(NAME_FILE, 'a+') as f:
        f.write(src + '\n')
        for face in json.loads(fp):
            f.write(write_position(face))
        f.write('.\n')

    return Response('ok', status=200)


if __name__ == "__main__":
    app.run()
