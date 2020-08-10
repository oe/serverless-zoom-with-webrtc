const cloud = require("@cloudbase/node-sdk");

const MEETING_COLLECTION = 'meeting-simple'

exports.main = async (data) => {
  const app = cloud.init({
    env: cloud.SYMBOL_CURRENT_ENV,
  })
  const collection = app.database().collection(MEETING_COLLECTION)
  try {
    const result = await collection.doc(data.meetingId).get()
    if (!result.data || !result.data.length) throw new Error('meeting not exists')
    const meeting = result.data[0]
    
    const changed = {}
    changed[data.type] = meeting[data.type] || []
    // 若新的tickets中包含 offer 或 answer, 则已经存储的tickets信息无效
    if (data.tickets.some(tk => ['offer', 'answer'].includes(tk.type))) {
      changed[data.type] = data.tickets
    } else {
      changed[data.type].push(...data.tickets)
    }
    // 另一方信息已经被接受使用, 已无效, 清空之, 避免 客户端 watch 时使用无效数据
    changed[ data.type === 'offer' ? 'answer' : 'offer'] = null
    const res = await collection.doc(data.meetingId).update(changed)
    return {
      code: 0,
      data: res
    }
  } catch (error) {
    return {
      code: 1,
      message: error.message
    }
  }
}
