import cv2


class Fonts(object):
    def these_images_should_be_similar(image1, image2, at_least=None, no_more_than=None):
        if at_least is None and no_more_than is None:
            at_least = 0.8
        images = list(map(cv2.imread, image1))
        result = cv2.matchTemplate(*images, cv2.TM_CCOEFF_NORMED)
        min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)
        if at_least is not None:
            assert max_val > at_least
        if no_more_than is not None:
            assert max_val < no_more_than
