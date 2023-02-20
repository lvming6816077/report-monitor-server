import React, { useState, useEffect } from 'react'
import { Button, Col, Row, Modal, Empty, Alert, Tree } from 'antd'
import { message } from 'antd'
import axios from 'axios'
import moment from 'moment'
import './SpeedSet.less'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { PlusSquareOutlined } from '@ant-design/icons'
import { RootState } from '@/store'

const SpeedSet: React.FC = () => {
    const userInfo = useSelector((state: RootState) => state.user.userInfo)
    const [treeData, setTreeData] = useState<TreeItem[]>([])
    const [codes, setCodes] = useState<string[]>()
    const [noData, setNoData] = useState<boolean>(false)

    const history = useHistory()

    const saveData = async () => {
        const result = await axios.post('/rapi/speed/saveSpeedSet', {
            projectId:userInfo.activePid,
            codes: codes?.filter((i) => !isNaN(Number(i))),
        })
        if (result.data.code == 0) {
            message.success('保存成功')
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            const result = await axios.get('/rapi/speed/getSpeedsAndSpeedset?projectId='+userInfo.activePid)
            const d = result.data.data
            if (d.list == 0) {
                setNoData(true)
                return
            }
            setTreeData(d.list)
            setCodes(d.speedset.split(','))
        }
        fetchData()
    }, [])
    const tProps = {
        treeData: treeData.filter((o) => o.children.length),
        onCheck: (v: any) => {
            setCodes(v)
        },
        multiple: true,
        defaultExpandAll: true,
        checkable: true,
        checkedKeys: codes,
        // checkStrictly:true,
        // showCheckedStrategy: TreeSelect.SHOW_CHILD,
        // placeholder: '请勾选测速点',
    }

    return (
        <>
            <div className="page-title">预设测速点</div>
            <div className="speedset-content">
                <div>
                    <Alert
                        message="在此页面进行测速点预设配置，将会在首页默认展示这个测速点的统计数据"
                        type="warning"
                        showIcon
                    />
                </div>
                {!noData ? (
                    <>
                        <div className="tree-content">
                            {treeData.length ? <Tree {...tProps} /> : null}
                        </div>
                        <div className="btn">
                            <Button type="primary" onClick={saveData}>
                                保存
                            </Button>
                        </div>
                    </>
                ) : (
                    <Empty
                        style={{ marginTop: 10 }}
                        description={
                            <span>
                                还没测速点，快去<a href="/createpoint">创建</a>
                                吧
                            </span>
                        }
                    />
                )}
            </div>
        </>
    )
}
export default SpeedSet