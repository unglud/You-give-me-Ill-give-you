<?php

namespace Unglued\GmgyBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;


class DefaultController extends Controller
{
    
    public function indexAction()
    {
        return $this->render('UngluedGmgyBundle:Default:index.html.twig', array('name' => 'name'));
    }
		
		public function aboutAction(){
        return $this->render('UngluedGmgyBundle:Default:about.html.twig');
    }
}
