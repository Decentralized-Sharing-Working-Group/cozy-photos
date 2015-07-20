cozydb = require 'cozydb'

module.exports = class IndieAuth extends cozydb.CozyModel
    @schema:
        me           	: String
        redirect_uri	: String
        client_id		: String
        scope  			: String
        response_type   : String
        state 	 		: String
        code      		: String
        token         	: String

              