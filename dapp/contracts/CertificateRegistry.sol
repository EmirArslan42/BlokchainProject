// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract CertificateRegistry {
    struct Certificate {
        bytes32 holderHash;
        string title;
        string issuer;
        uint64 issuedAt;
        uint64 expiresAt;
        bool revoked;
    }

    mapping(bytes32 => Certificate) public certificates;

    event CertificateIssued(bytes32 indexed id, uint64 timestamp);
    event CertificateRevoked(bytes32 indexed id, uint64 timestamp);

    function issue(
        bytes32 id,
        bytes32 holderHash,
        string memory title,
        string memory issuer,
        uint64 expiresAt
    ) external {
        require(certificates[id].issuedAt == 0, "Already issued");

        certificates[id] = Certificate({
            holderHash: holderHash,
            title: title,
            issuer: issuer,
            issuedAt: uint64(block.timestamp),
            expiresAt: expiresAt,
            revoked: false
        });

        emit CertificateIssued(id, uint64(block.timestamp));
    }

    function revoke(bytes32 id) external {
        require(certificates[id].issuedAt != 0, "Not found");
        certificates[id].revoked = true;

        emit CertificateRevoked(id, uint64(block.timestamp));
    }

    function verify(bytes32 id, bytes32 holderHash)
        external
        view
        returns (
            bool valid,
            bool isRevoked,
            uint64 issuedAt,
            uint64 expiresAt,
            string memory title,
            string memory issuer
        )
    {
        Certificate memory c = certificates[id];

        if (c.issuedAt == 0) {
            return (false, false, 0, 0, "", "");
        }

        bool ok = !c.revoked &&
            c.holderHash == holderHash &&
            (c.expiresAt == 0 || c.expiresAt >= block.timestamp);

        return (ok, c.revoked, c.issuedAt, c.expiresAt, c.title, c.issuer);
    }
}
