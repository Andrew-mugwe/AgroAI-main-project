import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

interface Dispute {
  id: string
  orderId: string
  buyerId: string
  sellerId: string
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_BUYER' | 'RESOLVED_SELLER' | 'ESCALATED'
  reason: 'undelivered' | 'damaged' | 'wrong_item' | 'other'
  description: string
  evidence: string[]
  resolutionNote?: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  escalatedAt?: string
}

const Disputes: React.FC = () => {
  const { user } = useAuth()
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [showOpenForm, setShowOpenForm] = useState(false)
  const [showResponseForm, setShowResponseForm] = useState(false)

  useEffect(() => {
    // Mock data for demo
    const mockDisputes: Dispute[] = [
      {
        id: 'dispute-1',
        orderId: 'order-123',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        status: 'OPEN',
        reason: 'damaged',
        description: 'Item arrived damaged and unusable',
        evidence: ['damage_photo_1.jpg', 'damage_photo_2.jpg'],
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'dispute-2',
        orderId: 'order-124',
        buyerId: 'buyer-2',
        sellerId: 'seller-2',
        status: 'UNDER_REVIEW',
        reason: 'undelivered',
        description: 'Package never arrived despite tracking showing delivered',
        evidence: ['tracking_screenshot.png'],
        createdAt: '2024-01-14T14:20:00Z',
        updatedAt: '2024-01-14T16:45:00Z'
      },
      {
        id: 'dispute-3',
        orderId: 'order-125',
        buyerId: 'buyer-3',
        sellerId: 'seller-3',
        status: 'RESOLVED_BUYER',
        reason: 'wrong_item',
        description: 'Received wrong variety of seeds',
        evidence: ['wrong_item_photo.jpg'],
        resolutionNote: 'Buyer refunded due to incorrect item sent',
        createdAt: '2024-01-10T09:15:00Z',
        updatedAt: '2024-01-12T11:30:00Z',
        resolvedAt: '2024-01-12T11:30:00Z'
      }
    ]
    setDisputes(mockDisputes)
    setLoading(false)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">🚨 OPEN</span>
      case 'UNDER_REVIEW':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">🔍 UNDER REVIEW</span>
      case 'RESOLVED_BUYER':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">✅ RESOLVED (Buyer)</span>
      case 'RESOLVED_SELLER':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">✅ RESOLVED (Seller)</span>
      case 'ESCALATED':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">⚖️ ESCALATED</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{status}</span>
    }
  }

  const getReasonDescription = (reason: string) => {
    switch (reason) {
      case 'undelivered':
        return 'Item not delivered'
      case 'damaged':
        return 'Item damaged during shipping'
      case 'wrong_item':
        return 'Wrong item received'
      case 'other':
        return 'Other issue'
      default:
        return 'Unknown reason'
    }
  }

  const handleOpenDispute = (orderId: string) => {
    console.log('Opening dispute for order:', orderId)
    setShowOpenForm(true)
  }

  const handleRespondToDispute = (disputeId: string) => {
    const dispute = disputes.find(d => d.id === disputeId)
    setSelectedDispute(dispute || null)
    setShowResponseForm(true)
  }

  const handleEscalateDispute = (disputeId: string) => {
    console.log('Escalating dispute:', disputeId)
  }

  const handleResolveDispute = (disputeId: string, decision: string) => {
    console.log('Resolving dispute:', disputeId, 'Decision:', decision)
  }

  if (loading) {
    return <div className="p-8">Loading disputes...</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Disputes & Resolution Center</h1>
        <button
          onClick={() => setShowOpenForm(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          🚨 Open New Dispute
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{disputes.filter(d => d.status === 'OPEN').length}</div>
          <div className="text-sm text-red-700">Open Disputes</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{disputes.filter(d => d.status === 'UNDER_REVIEW').length}</div>
          <div className="text-sm text-yellow-700">Under Review</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{disputes.filter(d => d.status.includes('RESOLVED')).length}</div>
          <div className="text-sm text-green-700">Resolved</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{disputes.filter(d => d.status === 'ESCALATED').length}</div>
          <div className="text-sm text-purple-700">Escalated</div>
        </div>
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {disputes.map((dispute) => (
          <div key={dispute.id} className="border rounded-lg p-6 bg-white shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Dispute #{dispute.id}</h3>
                <p className="text-gray-600">Order #{dispute.orderId}</p>
                <p className="text-sm text-gray-500">
                  {getReasonDescription(dispute.reason)} • Created: {new Date(dispute.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                {getStatusBadge(dispute.status)}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-700">{dispute.description}</p>
              {dispute.evidence.length > 0 && (
                <div className="mt-2">
                  <span className="text-sm font-medium text-gray-600">Evidence: </span>
                  <span className="text-sm text-blue-600">{dispute.evidence.join(', ')}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Last updated: {new Date(dispute.updatedAt).toLocaleDateString()}
              </div>

              <div className="flex space-x-2">
                {dispute.status === 'OPEN' && (
                  <button
                    onClick={() => handleRespondToDispute(dispute.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    📝 Respond
                  </button>
                )}
                
                {dispute.status === 'UNDER_REVIEW' && (
                  <>
                    <button
                      onClick={() => handleEscalateDispute(dispute.id)}
                      className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
                    >
                      ⚖️ Escalate
                    </button>
                    <button
                      onClick={() => handleResolveDispute(dispute.id, 'buyer_favor')}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      ✅ Resolve (Buyer)
                    </button>
                    <button
                      onClick={() => handleResolveDispute(dispute.id, 'seller_favor')}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      ✅ Resolve (Seller)
                    </button>
                  </>
                )}

                {dispute.resolutionNote && (
                  <div className="text-sm text-gray-600">
                    Resolution: {dispute.resolutionNote}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Open Dispute Modal */}
      {showOpenForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Open New Dispute</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter order ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <select className="w-full border rounded px-3 py-2">
                  <option value="undelivered">Item not delivered</option>
                  <option value="damaged">Item damaged</option>
                  <option value="wrong_item">Wrong item received</option>
                  <option value="other">Other issue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="Describe the issue in detail"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowOpenForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  🚨 Open Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseForm && selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Respond to Dispute</h3>
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600 mb-2">Dispute: {selectedDispute.id}</p>
              <p className="text-sm">{selectedDispute.description}</p>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Response</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  rows={4}
                  placeholder="Provide your side of the story and any evidence"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowResponseForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  📝 Submit Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Disputes
