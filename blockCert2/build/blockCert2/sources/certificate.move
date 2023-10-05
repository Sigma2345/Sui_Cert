module blockcert2::certificate {
    use sui::hash ; 
    use sui::transfer::{Self};
    use sui::object::{Self, ID,UID};
    use sui::tx_context::{Self,TxContext};
    use sui::url::{Self, Url};
    use sui::event ;
    // use std::string::{Self,String};
    // use std::option::{Self, Option};

    struct Certificate has key, store {
        id: UID,
        content: vector<u8>,
        ipfs_uri: Url
    }

    struct CertificateGenerateEvent has copy, drop {
        event_id: ID,
        certificage_generator: address,
        receiver_address: address,
        ipfs_uri: Url
    }

    public entry fun generate_certificate(
        _content: vector<u8>, 
        _ipfs_uri: vector<u8>,
        _receiver : address,
        ctx: &mut TxContext
    )
    {
        let cert = Certificate {
            id: object::new(ctx),
            content: hash::keccak256(&_content),
            ipfs_uri: url::new_unsafe_from_bytes(_ipfs_uri)
        };
        event::emit( CertificateGenerateEvent {
            event_id: object::uid_to_inner(&cert.id),
            certificage_generator: tx_context::sender(ctx),
            receiver_address: _receiver,
            ipfs_uri: url::new_unsafe_from_bytes(_ipfs_uri)
        });
        transfer::public_transfer(cert, _receiver);

    }

    //////////////////////////
    /// CERTIFICATE GETTERS //
    /////////////////////////
    public entry fun get_content(nft: &Certificate): vector<u8> {
        nft.content
    }
    
    public entry fun get_ipfs_uri(nft: &Certificate): Url {
        nft.ipfs_uri
    }
}
