# run-exclusive

Implement a generic stack call to ensure that a particular function
is executed sequentially across calls.
(we wait until the function has returned before calling again)

Note: Exception can not be caught.
