import { useModel } from "@umijs/max";
import { Button } from "antd";

const Help: React.FC<any> = ()=>{
const { initialState, setInitialState } = useModel('@@initialState');
        return <div>
              Help
        </div>
}



export default Help