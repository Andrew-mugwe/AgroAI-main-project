import { useState, useEffect } from 'react'
import { Save, X, Upload, Image as ImageIcon, Plus, Trash2, ArrowLeft } from 'lucide-react'

export function UpdateProduct() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    sku: '',
    price: '',
    comparePrice: '',
    costPrice: '',
    category: '',
    brand: '',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    inventory: {
      trackQuantity: true,
      quantity: '',
      lowStockThreshold: '',
      allowBackorder: false
    },
    images: [] as File[],
    existingImages: [] as string[],
    variants: [] as Array<{
      id: string
      name: string
      price: string
      sku: string
      quantity: string
    }>,
    seo: {
      metaTitle: '',
      metaDescription: '',
      slug: ''
    },
    status: 'draft',
    featured: false,
    tags: [] as string[]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [newTag, setNewTag] = useState('')

  const categories = [
    { id: '1', name: 'Seeds' },
    { id: '2', name: 'Tools' },
    { id: '3', name: 'Fertilizers' },
    { id: '4', name: 'Equipment' }
  ]

  const brands = [
    { id: '1', name: 'AgroTech' },
    { id: '2', name: 'GreenGrow' },
    { id: '3', name: 'FarmPro' },
    { id: '4', name: 'NatureSeed' }
  ]

  // Simulate loading product data
  useEffect(() => {
    // In a real app, this would fetch product data by ID
    setFormData({
      name: 'Organic Tomato Seeds',
      description: 'High-quality organic tomato seeds perfect for home gardening. These seeds produce delicious, juicy tomatoes with excellent flavor.',
      shortDescription: 'Premium organic tomato seeds for home gardens',
      sku: 'TOM-001',
      price: '15.99',
      comparePrice: '19.99',
      costPrice: '8.50',
      category: '1',
      brand: '1',
      weight: '0.1',
      dimensions: {
        length: '10',
        width: '5',
        height: '1'
      },
      inventory: {
        trackQuantity: true,
        quantity: '150',
        lowStockThreshold: '10',
        allowBackorder: false
      },
      images: [],
      existingImages: ['image1.jpg', 'image2.jpg'],
      variants: [
        {
          id: '1',
          name: 'Small Pack (50 seeds)',
          price: '8.99',
          sku: 'TOM-001-S',
          quantity: '100'
        },
        {
          id: '2',
          name: 'Large Pack (200 seeds)',
          price: '24.99',
          sku: 'TOM-001-L',
          quantity: '50'
        }
      ],
      seo: {
        metaTitle: 'Organic Tomato Seeds - Premium Quality',
        metaDescription: 'Buy high-quality organic tomato seeds for your garden. Fast shipping and excellent germination rates.',
        slug: 'organic-tomato-seeds'
      },
      status: 'active',
      featured: true,
      tags: ['organic', 'tomato', 'seeds', 'garden']
    })
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value
      }
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }))
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const removeExistingImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index)
    }))
  }

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, {
        id: Date.now().toString(),
        name: '',
        price: '',
        sku: '',
        quantity: ''
      }]
    }))
  }

  const removeVariant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(variant => variant.id !== id)
    }))
  }

  const updateVariant = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(variant =>
        variant.id === id ? { ...variant, [field]: value } : variant
      )
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required'
    }

    if (!formData.price) {
      newErrors.price = 'Price is required'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    
    // Add update product logic here
    console.log('Updating product:', formData)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Show success message or redirect
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="btn btn-outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Update Product</h1>
            <p className="text-gray-600">Edit product information and settings</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="btn btn-outline">
            <X className="mr-2 h-4 w-4" />
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="btn btn-primary"
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`input ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter product name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <textarea
                    value={formData.shortDescription}
                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                    rows={2}
                    className="input resize-none"
                    placeholder="Brief product description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={6}
                    className={`input resize-none ${errors.description ? 'border-red-500' : ''}`}
                    placeholder="Detailed product description"
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU *
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      className={`input ${errors.sku ? 'border-red-500' : ''}`}
                      placeholder="Product SKU"
                    />
                    {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand
                    </label>
                    <select
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      className="input"
                    >
                      <option value="">Select Brand</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className={`input ${errors.price ? 'border-red-500' : ''}`}
                    placeholder="0.00"
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compare Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.comparePrice}
                    onChange={(e) => handleInputChange('comparePrice', e.target.value)}
                    className="input"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => handleInputChange('costPrice', e.target.value)}
                    className="input"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="trackQuantity"
                    checked={formData.inventory.trackQuantity}
                    onChange={(e) => handleNestedInputChange('inventory', 'trackQuantity', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="trackQuantity" className="ml-2 block text-sm text-gray-900">
                    Track quantity
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={formData.inventory.quantity}
                      onChange={(e) => handleNestedInputChange('inventory', 'quantity', e.target.value)}
                      className="input"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      value={formData.inventory.lowStockThreshold}
                      onChange={(e) => handleNestedInputChange('inventory', 'lowStockThreshold', e.target.value)}
                      className="input"
                      placeholder="0"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allowBackorder"
                      checked={formData.inventory.allowBackorder}
                      onChange={(e) => handleNestedInputChange('inventory', 'allowBackorder', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="allowBackorder" className="ml-2 block text-sm text-gray-900">
                      Allow backorder
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Variants */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Product Variants</h3>
                <button
                  type="button"
                  onClick={addVariant}
                  className="btn btn-outline btn-sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Variant
                </button>
              </div>
              
              {formData.variants.length > 0 ? (
                <div className="space-y-4">
                  {formData.variants.map((variant) => (
                    <div key={variant.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Variant</h4>
                        <button
                          type="button"
                          onClick={() => removeVariant(variant.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                          className="input"
                          placeholder="Variant name"
                        />
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                          className="input"
                          placeholder="Variant SKU"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={variant.price}
                          onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                          className="input"
                          placeholder="Price"
                        />
                        <input
                          type="number"
                          value={variant.quantity}
                          onChange={(e) => updateVariant(variant.id, 'quantity', e.target.value)}
                          className="input"
                          placeholder="Quantity"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No variants added yet</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Product Images */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h3>
              <div className="space-y-4">
                {/* Existing Images */}
                {formData.existingImages.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Current Images</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {formData.existingImages.map((image, index) => (
                        <div key={index} className="relative">
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute -top-2 -right-2 h-6 w-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <p className="text-xs text-gray-500 mt-1 truncate">{image}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload New Images */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload new images</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="btn btn-outline btn-sm mt-2 cursor-pointer"
                  >
                    Choose Files
                  </label>
                </div>

                {/* New Images */}
                {formData.images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">New Images</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 h-6 w-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <p className="text-xs text-gray-500 mt-1 truncate">{image.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Settings */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`input ${errors.category ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="input"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                    Featured Product
                  </label>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="input flex-1"
                    placeholder="Add tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="btn btn-outline"
                  >
                    Add
                  </button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-primary-600 hover:text-primary-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
