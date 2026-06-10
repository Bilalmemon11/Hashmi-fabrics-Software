import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../../store/slices/authSlice'
import api from '../../api/axios'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const dispatch  = useDispatch()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { email, password })
      dispatch(setCredentials({ user: res.data.user, token: res.data.token }))
      navigate('/')
    } catch (err) {
      setError('Email ya password galat hai.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F5F4F0' }}>
      <div style={{ background:'#fff', border:'1px solid rgba(0,0,0,0.08)', borderRadius:12, padding:'32px 28px', width:360 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
          <div style={{ width:36, height:36, borderRadius:8, background:'#185FA5', color:'#fff', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center' }}>HT</div>
          <div>
            <div style={{ fontSize:14, fontWeight:600 }}>Hashmi Traders</div>
            <div style={{ fontSize:11, color:'#9A9A96' }}>Distribution System</div>
          </div>
        </div>
        {error && <div style={{ background:'#FCEBEB', color:'#A32D2D', padding:'8px 12px', borderRadius:8, fontSize:13, marginBottom:14 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:12, fontWeight:500, color:'#5A5A57', display:'block', marginBottom:4 }}>Email</label>
            <input className="ht-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@hashmitraders.com" required />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:12, fontWeight:500, color:'#5A5A57', display:'block', marginBottom:4 }}>Password</label>
            <input className="ht-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="ht-btn ht-btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
