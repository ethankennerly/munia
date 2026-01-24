# Fix Bugs

The worst user experience is the priority to fix. Sorted by priority first:

- [x] Entering text for post with about 100 lines did not display the post button on screen. It went up off the top of the screen.
- [x] Long unbroken word in text of post or comment on post was not wrapped. Part of the word went off the right side of the screen.
    - [x] Example: comment with 100 contiguous letters http://localhost:3002/en/posts/35?comment-id=10
- [x] Steps: Tap Reply to a comment. Dialog appears with text like "Reply You are replying to Ethan Kennerly's comment." In the input text field, type in a response that is very long, such as 1000 characters. 
    - [x] Actual Result shoud not occur: Submit and Cancel buttons scroll off the bottom of the screen. 
    - [x] Actual Result shoud not occur: The bottom of the Submit and Cancel button shapes are slightly clipped below the bottom of the screen.
    - [x] Actual Result should not occur: There are two vertical scroll bars adjacent to each other near the right side of the reply dialog.
    - [x] Actual Result should not occur: The height of the vertical scroll bar and the height of the text area should not extend below a small margin above the top of the Submit and Cancel buttons.
    - [x] Expected Result: The Submit and Cancel buttons remain visible on screen with a slight margin above the bottom of the screen. There is only one vertical scroll bar near the right side of the reply input text area. The input text area bottom is a small margin above the Submit and Cancel buttons.
- [ ] When clicking the feed section Create Post Image/Video button directly, an image to a post showed the operating system file modal, but did not really attach the image. Only after the Create Post modal was opened did the Image/Video button again display an operating system file selection modal and correctly attach an image.
- [ ] When selecting an image at 4KB x 4KB or larger the image failed to be attached. The failure is acceptable. But the message was unclear what the cause was.
