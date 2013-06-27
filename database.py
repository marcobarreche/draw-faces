from contextlib import closing
from flask import g
import MySQLdb


DATABASE_USER = 'root'
DATABASE_PASSWORD = 'root'
DATABASE_OPTIONS = {'charset': 'utf8'}
DATABASE_NAME = 'draw_faces'
DATABASE_HOST = 'localhost'
TABLE_NAME = 'faces'


def connect_db(app):
    opts = {
        'user': DATABASE_USER,
        'passwd': DATABASE_PASSWORD,
        'db': DATABASE_NAME,
        'host': DATABASE_HOST,
        'connect_timeout': 1
    }
    opts.update(DATABASE_OPTIONS)
    return MySQLdb.connect(**opts)


def close(db):
    if db:
        db.close()


def first(l):
    return l[0] if l else None


def get_faces_in_all_images():
    with closing(g.db.cursor())as c:
        c.execute("""
            SELECT url, positions
            FROM %(table)s
            """ % {'table': TABLE_NAME})
        return c.fetchall() or None
    return None


def get_faces_in_an_image(url):
    with closing(g.db.cursor())as c:
        c.execute("""
            SELECT positions
            FROM %(table)s
            WHERE url = %%s
            """ % {'table': TABLE_NAME}, url)
        return first(c.fetchone()) or None
    return None


def insert_position_of_faces(url, positions):
    with closing(g.db.cursor()) as c:
        status = c.execute("""
            INSERT INTO %(table)s (url, positions)
            VALUES (%%s, %%s) ON DUPLICATE KEY UPDATE positions=%%s
            """ % {'table': TABLE_NAME}, (url, positions, positions))
        g.db.commit()
        return status
    return None


def init_db(app):
    with closing(connect_db(app)) as db:
        with app.open_resource('schema.sql') as f:
            c = db.cursor()
            for sql_command in f.read().split(';'):
                if sql_command.strip():
                    c.execute(sql_command)
        db.commit()


def create_database(app):
    with closing(connect_db(app)) as db:
        c = db.cursor()
        c.execute('CREATE DATABASE ' + app.config['DATABASE_NAME'])
        db.commit()


def drop_test_database(app):
    with closing(connect_db(app)) as db:
        c = db.cursor()
        c.execute('DROP DATABASE ' + app.config['DATABASE_NAME'])