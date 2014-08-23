using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Net;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AliveControl
{
    public class API
    {
        public static String APIURL = "http://10.0.5.180/";
        public static String _CallAPI(String method, String data) 
        {
            String result = "";
            WebRequest request = WebRequest.Create("http://www.contoso.com/");
            request.Proxy = null; // <-- this is the good stuff
            request.Method = "POST";


            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            return result;
        }
    }
}
