pragma solidity ^0.5.0;

contract SocialNetwork {
    string public name;
    uint256 public postcount = 0;
    mapping(uint256 => Post) public posts;
    struct Post {
        uint256 id;
        string content;
        uint256 tipAmount;
        address payable author;
    }
    event PostCreated(
        uint256 id,
        string content,
        uint256 tipAmount,
        address payable author
    );
    event PostTipped(
        uint256 id,
        string content,
        uint256 tipAmount,
        address payable author
    );

    constructor() public {
        name = "Social Network";
    }

    function createPost(string memory _content) public {
        //require valid content
        require(bytes(_content).length > 0);
        //increment no of post
        postcount++;
        // create the post
        posts[postcount] = Post(postcount, _content, 0, msg.sender);
        //tigger event
        emit PostCreated(postcount, _content, 0, msg.sender);
    }

    function tipPost(uint256 _id) public payable {
        // Make sure the id is valid
        require(_id > 0 && _id <= postcount);
        //fetch the post
        Post memory _post = posts[_id];
        //fetch the author of the post
        address payable _author = _post.author;
        //pay the author by sending the ether
        address(_author).transfer(msg.value);
        //increment the tip amount
        _post.tipAmount = _post.tipAmount + msg.value;
        //upgrade the post
        posts[_id] = _post;
        //trigger an event
        emit PostTipped(postcount, _post.content, _post.tipAmount, _author);
    }
}
