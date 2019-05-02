require('dotenv-extended').load();
var azure=require("azure-storage");

function getSASURL(medialinkArr)
{
	var sas_linkArr=generateSasURL(medialinkArr);
	return sas_linkArr;	
}

function generateSasURL(Url_Array) {

    //split the urls and store in array
    var Outstr_url=[];
    var resp;
    
    for(var i=0;i<Url_Array.length; i++)
    {
        //split the url to get the container & blobname
        var Temp_Array = Url_Array[i].split("/");
        var context;
        var container=Temp_Array[Temp_Array.length-2];
        var blobName=Temp_Array[Temp_Array.length-1];
        if(container!="" && blobName!=""){
            resp=generateSasToken(context, container, blobName);
        }
        else{
            resp = null;
        }
        if(resp!=null && resp.uri!=null){
            Outstr_url[i]=resp.uri;
        }
        else{
            Outstr_url[i]=""; 
        }
    }
    return Outstr_url;
}

function generateSasToken(context, container, blobName) {
    var connString = process.env.SAS_Conn_String;
    try {
        var blobService = azure.createBlobService(connString);

        // Create a SAS token that expires in an hour
        // Set start time to five minutes ago to avoid clock skew.
        var startDate = new Date();
        startDate.setMinutes(startDate.getMinutes() );
        var expiryDate = new Date(startDate);
        expiryDate.setMinutes(startDate.getMinutes() + 5);
        var permissions = azure.BlobUtilities.SharedAccessPermissions.READ;
        var sharedAccessPolicy = {
            AccessPolicy: {
                Permissions: permissions,
                Start: startDate,
                Expiry: expiryDate
            }
        };
        var sasToken = blobService.generateSharedAccessSignature(container, blobName, sharedAccessPolicy);
        return {
            token: sasToken,
            uri: blobService.getUrl(container, blobName, sasToken, true)
        };
    } catch (error) {
        return null;
    }
}

module.exports = { getsasurl : getSASURL};
