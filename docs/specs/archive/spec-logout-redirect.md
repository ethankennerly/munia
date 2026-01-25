# Logout Redirect to Login Page

The worst user experience is the priority to fix. Sorted by priority first:

- [ ] Steps to Reproduce: iPhone 13. Chrome. Reload the feed page. Perhaps not all posts had loaded. Click Logout button. Click Confirm button. User is logged out.
    - [ ] Expected Result: Browser is redirected to the login page.
    - [ ] Actual Result should not occur: Browser is not redirected to the login page. Error appears that posts cannot be loaded.
- [x] Entering text for post with about 100 lines did not display the post button on screen. It went up off the top of the screen.
- [x] Long unbroken word in text of post or comment on post was not wrapped. Part of the word went off the right side of the screen.
    - [x] Example: comment with 100 contiguous letters http://localhost:3002/en/posts/35?comment-id=10