draw-faces
==========

1. Installation
	pip install Flask

2. Update html
	1. python generate_html.py draw_faces.html (*)
    2. python generate_html.py draw_faces.html <fold_with_all_the_images>
    (*) If you choose the option 1, the folder with all the images will be ./static/img

3. Init the database
	mysql -u root -p -e "CREATE DATABASE draw_faces DEFAULT CHARSET utf8;"
	mysql draw_faces < schema.sql -h localhost -u root -p

4. Execute
	python image-crop.py 0.0.0.0

5. Url of the service: http://<server_name>/static/draw-faces.html
6. Generate output.txt: http://<server_name>/generate_output
7. See all the faces position: http://<server_name>/get_faces_position

