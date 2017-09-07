pragma solidity ^0.4.6;


contract Admin {
        address public mOwner;
        address public mAdmin;

        function Admin() {
            mOwner = msg.sender;
            mAdmin = msg.sender;
        }

        modifier isOwner {
            require(msg.sender == mOwner);
            _;
        }

        modifier isAdmin {
            require(msg.sender == mAdmin);
            _;
        }

        function addAdmin (address _admin)
        isOwner
        public returns(bool){
            require(_admin != 0);
            mAdmin = _admin;
            return true;
        }


}
