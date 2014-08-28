using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Text;
using System.Net;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AliveControl
{
    public class API
    {
        public static String APIURL = "http://10.0.5.180:82";
        
        public static String SessionKey = null;
        public static String UUID = null;

        public static JObject _CallAPI(String method, NameValueCollection data) 
        {
            String result = "";
            JObject output;
            try
            {
                if (data == null)
                    data = new NameValueCollection();
                if (SessionKey != null)
                    data.Add(new NameValueCollection() { { "sessionkey", SessionKey } });
                using (WebClient client = new WebClient())
                {
                    result = System.Text.Encoding.UTF8.GetString(client.UploadValues(APIURL + "/api/" + method, data));
                }
                output = JsonConvert.DeserializeObject<JObject>(result);
            }
            catch (Exception e)
            {
                result = "{\"status\":\"NOK\",\"error\":\"INTERNAL\"}";
                output = JsonConvert.DeserializeObject<JObject>(result);
            }
            return output;
        }

        public Boolean Login(String username, String password, int maxdays)
        {
            JObject data = _CallAPI("login", new NameValueCollection()
            {
                {"username",username},
                {"password",password},
                {"maxdays",maxdays.ToString()}
            });
            if (data["status"].ToString().Equals("OK"))
            {
                SessionKey = data["sessionkey"].ToString();
                UUID = data["uuid"].ToString();
                return true;
            }
            else
                return false;
        }

        public Boolean Logout()
        {
            if (SessionKey != null)
            {
                JObject data = _CallAPI("login", null);
                if (data["status"].ToString().Equals("OK"))
                {
                    SessionKey = null;
                    UUID = null;
                    return true;
                }
                else
                    return false;
            }
            else
                return true;
        }
    }
}
