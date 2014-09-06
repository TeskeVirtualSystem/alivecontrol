using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;


namespace AliveControl
{
    public class DRBDConn
    {
        public int id;
        public String CS, RO, DS, NS;

        public JObject GetACObj()
        {
            JObject obj = new JObject();
            obj["cs"] = CS;
            obj["ro"] = RO;
            obj["ds"] = DS;
            obj["ns"] = NS;
            obj["id"] = id;
            return obj;
        }
    }
}
