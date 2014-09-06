using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AliveControl
{
    public class MySQL
    {
        public String MasterHost, MasterUser, SlaveStatus, IOStatus, SQLStatus;

        public JObject GetACObj()
        {
            JObject obj = new JObject();
            //TODO
            return obj;
        }
    }
}
