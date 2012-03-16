class User < ActiveRecord::Base
  ROLES = ['su', 'admin','auditor','internal']
  
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :name, :email, :username, :password, :password_confirmation, :remember_me, :role
  
  #validations
  validates :username, :uniqueness => true

  has_many :associations, :dependent => :destroy
  has_many :proposals, :through => :associations
  
  def role?(role)
    self.role == role.to_s
  end
end
