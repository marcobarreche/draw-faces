draw-faces
==========

1. Installation
	apt-get install mysql-client mysql-server libmysqlclient-dev
	pip install Flask MySQL-python==1.2.3

2. Update html
	1. python generate_html.py draw_faces.html (*)
    2. python generate_html.py draw_faces.html <fold_with_all_the_images>
    (*) If you choose the option 1, the folder with all the images will be ./static/img

3. Init the database
	mysql -u root -p -e "CREATE DATABASE draw_faces DEFAULT CHARSET utf8;"
	mysql draw_faces < schema.sql -h localhost -u root -p
	(*) The password is 'root'

4. Execute
	python image-crop.py 0.0.0.0

5. Url of the service: http://eu5.thumbr.it/static/draw-faces.html
6. See all the faces position: http://eu5.thumbr.it/get_faces_position
