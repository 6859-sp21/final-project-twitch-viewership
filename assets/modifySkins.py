# To run: python modifySkins.js

from PIL import Image
import os

BASE_FOLDER = "dream-smp-skins"

FULLBODY_FOLDER = "{}/full-body".format(BASE_FOLDER)
HALFBODY_FOLDER = "{}/half-body".format(BASE_FOLDER)
EMPTYBODY_FOLDER = BASE_FOLDER

def createEmptyBody(inFolder, outFolder):
  for _, _, files in os.walk(inFolder):
    for file in files:
      if(file!=".DS_Store"):
        img = Image.open("{}/{}".format(inFolder, file))
        img = img.convert("RGBA")
        pixels = img.getdata()
        newPixels = []
        for (r,g,b,a) in pixels:
          if a!=0: # a=0 is transparent
            newPixels.append((0, 0, 0, a)) # black
          else:
            newPixels.append((r,g,b,a))
        img.putdata(newPixels)
        img.save("{}/empty-body.png".format(outFolder), "PNG")
      break

def createHalfBodies(inFolder, outFolder):
  for _, _, files in os.walk(inFolder):
    for file in files:
      if(file!=".DS_Store"):
        img = Image.open("{}/{}".format(inFolder, file))
        img = img.convert("RGBA")
        width, height = img.size
        pixels = img.getdata()
        newPixels = [None]*len(list(pixels))
        for i in range(height):
          for j in range(width):
            stride = (width*i) + j
            (r,g,b,a) = pixels[stride]
            if (a!=0 and j>width/2):
              newPixels[stride] = (0, 0, 0, a)
            else:
              newPixels[stride] = (r,g,b,a)
        img.putdata(newPixels)
        img.save("{}/{}".format(outFolder, file), "PNG")

if __name__ == "__main__":
  #createEmptyBody(inFolder=FULLBODY_FOLDER, outFolder=EMPTYBODY_FOLDER)
  #createHalfBodies(inFolder=FULLBODY_FOLDER, outFolder=HALFBODY_FOLDER)
  createHalfBodies(inFolder="fullbody", outFolder="halfbody")

