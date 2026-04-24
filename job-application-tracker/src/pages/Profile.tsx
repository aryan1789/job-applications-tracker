import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthProvider'
import { supabase } from '../lib/supabase'
import { FiX } from 'react-icons/fi'
import { useTheme } from '../utils/useTheme'

export default function Profile() {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) return
    setName(user.user_metadata?.full_name ?? '')
    setBio(user.user_metadata?.bio ?? '')
    setAvatarUrl(user.user_metadata?.avatar_url ?? null)
  }, [user])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      let newAvatarUrl = avatarUrl

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `${user.id}/avatar.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true })

        if (uploadError) throw new Error(uploadError.message)

        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        newAvatarUrl = `${data.publicUrl}?t=${Date.now()}`
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: name.trim(),
          bio: bio.trim(),
          avatar_url: newAvatarUrl,
        },
      })

      if (updateError) throw new Error(updateError.message)

      setAvatarUrl(newAvatarUrl)
      setAvatarFile(null)
      setAvatarPreview(null)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message ?? String(err))
    } finally {
      setSaving(false)
    }
  }

  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
  const label = isDark ? 'text-slate-400' : 'text-slate-500'
  const input = isDark
    ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'

  const displayAvatar = avatarPreview ?? avatarUrl
  const initial = (user?.user_metadata?.full_name ?? user?.email ?? '?')[0].toUpperCase()

  return (
    <div className="max-w-lg mx-auto py-6 px-4">
      <h1 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
        Profile
      </h1>

      <div className={`rounded-xl border p-6 flex flex-col gap-6 ${card}`}>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-24 h-24">
            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload profile picture"
              className="w-24 h-24 rounded-full overflow-hidden focus:outline-none"
            >
              {displayAvatar ? (
                <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-3xl font-semibold ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-300 text-slate-950'}`}>
                  {initial}
                </div>
              )}
            </button>
            {displayAvatar && (
              <button
                onClick={() => { setAvatarFile(null); setAvatarPreview(null); setAvatarUrl(null) }}
                aria-label="Remove profile picture"
                className="absolute top-0 right-0 w-6 h-6 rounded-full bg-slate-600 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition-colors"
              >
                <FiX size={12} />
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-indigo-500 hover:underline"
          >
            {displayAvatar ? 'Change photo' : 'Upload photo'}
          </button>
        </div>

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className={`text-xs font-semibold uppercase tracking-wider ${label}`}>
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            className={`w-full border rounded-lg px-3 py-2 text-sm ${input}`}
          />
        </div>

        {/* Email — read only */}
        <div className="flex flex-col gap-1.5">
          <label className={`text-xs font-semibold uppercase tracking-wider ${label}`}>
            Email
          </label>
          <div className={`text-sm px-3 py-2 rounded-lg border ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
            {user?.email ?? '—'}
          </div>
        </div>

        {/* Bio */}
        <div className="flex flex-col gap-1.5">
          <label className={`text-xs font-semibold uppercase tracking-wider ${label}`}>
            Bio
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="A short bio…"
            className={`w-full border rounded-lg px-3 py-2 text-sm resize-none ${input}`}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>Profile saved.</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
