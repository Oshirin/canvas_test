#!/usr/bin/env python
# -*- coding: utf-8 -*-

import cgi
import os, sys
import cv2
import time
import codecs
import numpy as np
import scipy.sparse
import PIL.Image
import pyamg
import base64

print "Content-Type: text/html; charset=utf-8;\r\n"

print "<html><body>"
print '<meta http-equiv="Refresh" content="1;URL=../print.html">'

def save_upload_file (updir, file1, file2, file3, i = 0) :

	if file1.value == "" or file2.value == "" :
		print "<h1>ERROR</h1>"
		
	# ファイルパスを設定(画像の名前はそのときの時間+ファイル+拡張子)
	# str() : 数字を文字列に変換
	# os.path.basename( path(ファイルパスのこと) ) : パスpathの末尾のファイル名を返す(今回の場合、画像名.拡張子)
	Path1 = os.path.join(updir,str(int(time.time())) + str(i) + os.path.basename(file1.filename))
	i += 1
	
	# ファイルのアップロード
	fout = file(Path1, "wb")
	# 100000バイト読み込み
	while 1:
		chunk = file1.file.read(100000)
		if not chunk: break
		fout.write(chunk)
	fout.close()
	
	Path2 = os.path.join(updir, str(int(time.time())) + str(i) + os.path.basename(file2.filename))
	i += 1
	
	# ファイルのアップロード
	fout = file(Path2, "wb")
	# 100000バイト読み込み
	while 1:
		chunk = file2.file.read(100000)
		if not chunk: break
		fout.write(chunk)
	fout.close()
	
	Path3 = os.path.join(updir, str(int(time.time())) + str(i) + os.path.basename(file2.filename))
	i += 1
	
	# ファイルのアップロード
	fout = file(Path3, "wb")
	# 100000バイト読み込み
	image = base64.b64decode(file3)
	fout.write(image)
	fout.close()
	
	return Path1, Path2, Path3

def blend(img_target, img_source, img_mask, offset):
	# compute regions to be blended
	region_source = (
			max(-offset[0], 0),
			max(-offset[1], 0),
			min(img_target.shape[0]-offset[0], img_source.shape[0]),
			min(img_target.shape[1]-offset[1], img_source.shape[1]))
	region_target = (
			max(offset[0], 0),
			max(offset[1], 0),
			min(img_target.shape[0], img_source.shape[0]+offset[0]),
			min(img_target.shape[1], img_source.shape[1]+offset[1]))
	region_size = (region_source[2]-region_source[0], region_source[3]-region_source[1])

	# clip and normalize mask image
	img_mask = img_mask[region_source[0]:region_source[2], region_source[1]:region_source[3]]
	img_mask[img_mask==0] = False
	img_mask[img_mask!=False] = True

	# create coefficient matrix
	A = scipy.sparse.identity(np.prod(region_size), format='lil')
	for y in range(region_size[0]):
		for x in range(region_size[1]):
			if img_mask[y,x]:
				index = x+y*region_size[1]
				A[index, index] = 4
				if index+1 < np.prod(region_size):
					A[index, index+1] = -1
				if index-1 >= 0:
					A[index, index-1] = -1
				if index+region_size[1] < np.prod(region_size):
					A[index, index+region_size[1]] = -1
				if index-region_size[1] >= 0:
					A[index, index-region_size[1]] = -1
	A = A.tocsr()
    
	# create poisson matrix for b
	P = pyamg.gallery.poisson(img_mask.shape)

	# for each layer (ex. RGB)
	for num_layer in range(img_target.shape[2]):
		# get subimages
		t = img_target[region_target[0]:region_target[2],region_target[1]:region_target[3],num_layer]
		s = img_source[region_source[0]:region_source[2], region_source[1]:region_source[3],num_layer]
		t = t.flatten()
		s = s.flatten()

		# create b
		b = P * s
		for y in range(region_size[0]):
			for x in range(region_size[1]):
				if not img_mask[y,x]:
					index = x+y*region_size[1]
					b[index] = t[index]

		# solve Ax = b
		x = pyamg.solve(A,b,verb=False,tol=1e-10)

		# assign x to target image
		x = np.reshape(x, region_size)
		x[x>255] = 255
		x[x<0] = 0
		x = np.array(x, img_target.dtype)
		cv2.imwrite("./cgi-bin/save/asas.jpg", x)
		cv2.imwrite("./cgi-bin/save/asdasasasd.jpg", img_target)
		img_target[region_target[0]:region_target[2],region_target[1]:region_target[3],num_layer] = x

	return img_target


if __name__ == "__main__" :

	form = cgi.FieldStorage()
	
	idx1 = form["txt1"].value
	idx2 = form["txt2"].value
	idx3 = form["txt3"].value
	idx4 = form["txt4"].value
	fileitem1 = form["image/*"]
	fileitem2 = form["gousei"]
	txt = form.getfirst('can', '')
	fileitem3 = txt.split(",")[1]
	
	backidx1 = form["txt11"].value
	backidx2 = form["txt22"].value
	backidx3 = form["txt33"].value
	backidx4 = form["txt44"].value
	
	#print idx1, " ", idx2, " ", idx3, " ", idx4, "<br>"

	path1, path2, path3 = save_upload_file("cgi-bin/pic/", fileitem1, fileitem2, fileitem3)
	
	img1 = PIL.Image.open(path1)
	img1 = img1.crop((int(idx1), int(idx2), int(idx3), int(idx4)))
	back = np.asarray(img1)
	back.flags.writeable = True
	
	img2 = np.asarray(PIL.Image.open(path2))
	img2.flags.writeable = True
	
	back = cv2.resize(back, (abs(int(backidx1) - int(backidx3)), abs(int(backidx2) - int(backidx4))))
	
	mask = PIL.Image.open(path3).convert("L")
	mask = mask.crop((int(idx1), int(idx2), int(idx3), int(idx4)))
	mask = np.asarray(mask)
	mask.flags.writeable = True
	mask = cv2.resize(mask, (abs(int(backidx1) - int(backidx3)), abs(int(backidx2) - int(backidx4))))
	
	
#	print mask.shape
	
#	masksrc = np.zeros((mask.shape[0], mask.shape[1]))
#	masksrc.fill(0)
	
#	for y in range(0, mask.shape[0]) :
#		for x in range(0, mask.shape[1]) :
#			if mask[y][x][0] == 255 :
#				masksrc[y][x] = 255
	
#	for y in range(int(idx2), int(idx4)) :
#		for x in range(int(idx1), int(idx3)) :
#			mask[y][x] = 255
	
	cv2.imwrite("./cgi-bin/save/source.jpg", back)
	cv2.imwrite("./cgi-bin/save/mask.jpg", mask)
	cv2.imwrite("./cgi-bin/save/target.jpg", img2)
	
#	ans = blend(img2, back, mask)
	ans = blend(img2, back, mask, (int(backidx2), int(backidx1)))
	ans = PIL.Image.fromarray(np.uint8(ans))
	
	ans.save("./cgi-bin/save/finish.jpg")

	
print "</html></body>"