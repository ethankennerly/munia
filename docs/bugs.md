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
- [x] Steps to Reproduce: Load the feed. Scroll to the Create Post section. Click the Image/Video button directly. Operating system file selection modal opened. Pick an image file. The Create Post dialog opened.
    - [x] Actual Result should not occur: No image was attached to the post.
    - [x] Expected Result: The image is attached to the post.
- [ ] Steps to Reproduce: Select an image at 4KB x 4KB or larger.
    - [x] Expected Result: The image failed to be attached. The failure is acceptable.
    - [ ] Expected Result: A message is displayed explaining  file is too large.
    - [ ] Actual Result should not occur: But the message was unclear what the cause was.
