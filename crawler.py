import os
import sys
import urllib
import urllib2
import re
import uuid
from multiprocessing.pool import ThreadPool


def download(url):
    headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.93'}
    try:
        req = urllib2.Request(url[0], None, headers)
        r = urllib2.urlopen(req)
        name = str(uuid.uuid4())[:5]
        ext = url[-1]
        print url
        print name
        print ext
        with open(s + '/%s.%s' % (name, ext), 'w') as f:
            print 'Save %s.%s' % (name, ext)
            f.write(r.read())
        r.close()
    except:
        pass


s = sys.argv[1]
try:
    os.mkdir(s)
except OSError:
    pass

qs = urllib.quote(s)
headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.93'}
req = urllib2.Request('https://www.google.com/search?site=&tbm=isch&source=hp&biw=1201&bih=822&q=%s&oq=%s' % (qs, qs), None, headers)
r = urllib2.urlopen(req)
content = r.read()
r.close()

pool = ThreadPool(processes=50)
# use map_async(...).get(99999) to make Keyboard interrupt work
imurls = re.findall(r'imgurl=(http://[^"\']*\.(png|jpg))', content)
print 'Found %d images' % (len(imurls),)
pool.map_async(download, imurls).get(999999)
pool.close()
